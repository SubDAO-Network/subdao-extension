import { useCopyToClipboard } from 'react-use'
import { useState, useCallback, useEffect } from 'react'
import { CreditCard as CreditCardIcon } from 'react-feather'
import { TextField, makeStyles, createStyles, FormControlLabel, Checkbox, Theme } from '@material-ui/core'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import IconButton from '@material-ui/core/IconButton'
import { mnemonicValidate } from '@polkadot/util-crypto'

import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps, useSnackbarCallback } from '../Base'

import { DebounceButton } from '../../DashboardComponents/ActionButton'
import AbstractTab, { AbstractTabProps } from '../../DashboardComponents/AbstractTab'
import ShowcaseBox from '../../DashboardComponents/ShowcaseBox'
import { checkInputLengthExceed } from '../../../../utils/utils'
import { WALLET_OR_PERSONA_NAME_MAX_LEN } from '../../../../utils/constants'

import { WalletRPC } from '../../../../plugins/Wallet/messages'
import { generateSeed, AddressState, updateAddress, rawValidate } from '../../../../plugins/Wallet/services/keyring'
import { currentSelectedWalletProviderSettings } from '../../../../plugins/Wallet/settings'
import type { SeedType } from '../../../../plugins/Wallet/services/keyring'

import { getProvider, getNetworkPrefix } from '../../../../polkadot/utils/helpers'
import { keypairType } from '../../../../polkadot/constants'

import { useValueRef } from '../../../../utils/hooks/useValueRef'
import { useI18N } from '../../../../utils/i18n-next-ui'

import { currentSubstrateNetworkSettings } from '../../../../settings/settings'

const useWalletCreateDialogStyle = makeStyles((theme: Theme) =>
    createStyles({
        confirmation: {
            fontSize: 16,
            lineHeight: 1.75,
            [theme.breakpoints.down('sm')]: {
                fontSize: 14,
            },
        },
        notification: {
            fontSize: 12,
            fontWeight: 500,
            textAlign: 'center',
            backgroundColor: '#FFD5B3',
            color: 'black',
            padding: '8px 22px',
            margin: '24px -36px 0',
            [theme.breakpoints.down('sm')]: {
                margin: '24px -16px 0',
            },
        },
        notificationIcon: {
            width: 16,
            height: 16,
            color: '#FF9138',
        },
        backButton: {
            marginRight: theme.spacing(1),
        },
        instructions: {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
            textAlign: 'left',
        },
        margin: {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
        },
        mnemonic: {
            display: 'flex',
            alignItems: 'center',
        },
        iconCopy: {
            marginLeft: theme.spacing(1),
        },
        section: {
            textAlign: 'left',
        },
    }),
)

export function WalletCreateDialog(props: WrappedDialogProps<object>) {
    const { t } = useI18N()
    const state = useState(0)
    const classes = useWalletCreateDialogStyle()

    const [name, setName] = useState('')
    const [checkSave, setCheckSave] = useState(false)
    const [seedType, setSeedType] = useState<SeedType>('bip')
    const provider = useValueRef(currentSelectedWalletProviderSettings)
    const networkPrefix = getNetworkPrefix(provider)
    const [{ address, derivePath, pairType, seed }, setAddress] = useState<AddressState>(() =>
        generateSeed(null, '', seedType, keypairType, networkPrefix),
    )
    const [, copyToClipboard] = useCopyToClipboard()
    const onChangeSeed = useCallback(
        (newSeed: string) => {
            const address = updateAddress(newSeed, derivePath, seedType, pairType, networkPrefix)
            setAddress(address)
        },
        [derivePath, pairType, seedType],
    )

    useEffect(() => {
        let newSeedType: SeedType = state[0] === 0 ? 'bip' : 'raw'
        if (seedType !== newSeedType) {
            setAddress(generateSeed(null, derivePath, newSeedType, pairType))
            setSeedType(newSeedType)
        }
        return () => {
            const network = currentSubstrateNetworkSettings.value
            const provider = getProvider(network)
            if (network.toString() !== currentSelectedWalletProviderSettings.value.toString()) {
                currentSelectedWalletProviderSettings.value = provider
            }
        }
    }, [state, derivePath, pairType, seedType])

    const onCopyMnemonic = useSnackbarCallback(
        async () => {
            if (!seed) return
            copyToClipboard(seed)
        },
        [seed],
        undefined,
        undefined,
        undefined,
        t('copy_to_clipboard'),
    )

    const onCheckboxChange = useCallback(() => {
        setCheckSave((x) => !x)
    }, [])

    const f = (
        <>
            <TextField
                helperText={
                    checkInputLengthExceed(name)
                        ? t('input_length_exceed_prompt', {
                              name: t('wallet_name').toLowerCase(),
                              length: WALLET_OR_PERSONA_NAME_MAX_LEN,
                          })
                        : undefined
                }
                required
                autoFocus
                label={t('wallet_name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
            />
            <FormControlLabel
                control={<Checkbox checked={checkSave} onChange={onCheckboxChange} name="checksave" color="primary" />}
                label={t('mnemonic_saved')}
            />
        </>
    )

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('mnemonic_words'),
                children: (
                    <>
                        <div className={classes.mnemonic}>
                            <TextField
                                required
                                label={t('mnemonic_words')}
                                value={seed}
                                onChange={(e) => onChangeSeed(e.target.value)}
                                multiline
                                rows={2}
                                variant="outlined"
                            />
                            <IconButton
                                className={classes.iconCopy}
                                color="primary"
                                size="small"
                                onClick={onCopyMnemonic}>
                                <FileCopyIcon fontSize="small" />
                            </IconButton>
                        </div>
                        {f}
                    </>
                ),
            },
            {
                label: t('private_key'),
                children: (
                    <div>
                        <TextField
                            required
                            label={t('private_key')}
                            value={seed}
                            onChange={(e) => onChangeSeed(e.target.value)}
                            multiline
                            rows={2}
                            variant="outlined"
                        />
                        {f}
                    </div>
                ),
                sx: { display: 'flex', p: 0 },
            },
        ],
        state,
        height: 200,
    }

    const content = (
        <>
            <section className={classes.section}>
                <ShowcaseBox title={t('wallet_address')}>{address}</ShowcaseBox>
            </section>
            <AbstractTab {...tabProps} />
        </>
    )

    const onSubmit = useSnackbarCallback(
        async () => {
            if (state[0] === 0) {
                if (!mnemonicValidate(seed)) throw new Error(t('import_failed'))
                await WalletRPC.createNewWallet({
                    address: address || '',
                    passphrase: '',
                    name,
                    mnemonic: seed.split(' '),
                })
            }
            if (state[0] === 1) {
                if (!rawValidate) throw new Error(t('import_failed'))
                await WalletRPC.importNewWallet({
                    name,
                    address: address || '',
                    _private_key_: seed,
                })
            }
        },
        [name, address, seed],
        props.onClose,
    )
    const checkNext = () => {
        return !!address && !!name && checkSave
    }
    const footer = (
        <DebounceButton variant="contained" disabled={!checkNext()} onClick={onSubmit}>
            {t('create')}
        </DebounceButton>
    )

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<CreditCardIcon />}
                iconColor="#4EE0BC"
                primary={t('plugin_wallet_on_create')}
                size="large"
                content={content}
                footer={footer}
            />
        </DashboardDialogCore>
    )
}
