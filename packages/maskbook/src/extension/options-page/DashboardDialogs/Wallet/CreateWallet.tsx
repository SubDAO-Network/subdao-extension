import { useCopyToClipboard } from 'react-use'
import { useState, useCallback, useEffect } from 'react'
import { CreditCard as CreditCardIcon } from 'react-feather'
import {
    TextField,
    makeStyles,
    createStyles,
    FormControlLabel,
    Checkbox,
    Theme,
    Typography,
    InputBase,
} from '@material-ui/core'
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

import { getNetworkPrefix, getProvider, getNetwork } from '../../../../polkadot/utils/helpers'
import { keypairType } from '../../../../polkadot/constants'

import { useValueRef } from '../../../../utils/hooks/useValueRef'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { currentSubstrateNetworkSettings } from '../../../../settings/settings'
import { ToolIconURLs } from '../../../../resources/tool-icon'

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
            position: 'relative',
        },
        iconCopy: {
            position: 'absolute',
            right: 6,
            bottom: 20,
        },
        section: {
            textAlign: 'left',
        },
        address: {
            padding: theme.spacing(1.25),
            backgroundColor: theme.palette.mode === 'dark' ? '#313768' : '#F7F8FB',
            marginBottom: 20,
            borderRadius: 4,
            fontSize: '14px',
        },
        inputTitle: {
            fontSize: '14px',
            color: theme.palette.text.secondary,
            marginBottom: 6,
            textAlign: 'left',
            '& span': {
                color: '#D52473',
            },
        },
        mnemonicInput: {
            height: 80,
            borderRadius: 4,
            border: '2px solid rgba(213, 17, 114, 0.2)',
            padding: theme.spacing(1.25),
            fontSize: 14,
            lineHeight: '16px',
            marginBottom: 16,
        },
        mnemonicInner: {
            height: '100%',
        },
        checkLabel: {
            textAlign: 'left',
            paddingLeft: 10,
            marginTop: 8,
        },
        privateInput: {
            height: 80,
            background: '#F7F8FB',
            borderRadius: 4,
            padding: theme.spacing(1.25),
            fontSize: 14,
            lineHeight: '16px',
            marginBottom: 16,
            '& textarea': {
                height: '100%',
            },
        },
        walletInput: {
            height: 40,
            fontSize: 14,
            background: '#F7F8FB',
            padding: 10,
            borderRadius: 4,
        },
        inputHelp: {
            color: '#D52473',
            fontSize: 14,
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
            setAddress(generateSeed(null, derivePath, newSeedType, pairType, networkPrefix))
            setSeedType(newSeedType)
        }
    }, [state, derivePath, pairType, seedType])

    useEffect(() => {
        return () => {
            const curNetwork = currentSubstrateNetworkSettings.value
            const curProvider = getProvider(curNetwork)
            const provider = currentSelectedWalletProviderSettings.value
            const network = getNetwork(provider)
            if (curNetwork !== network) {
                currentSelectedWalletProviderSettings.value = curProvider
            }
        }
    }, [])

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
            <Typography className={classes.inputTitle}>
                {t('wallet_name')}
                <span>*</span>
            </Typography>
            <InputBase
                classes={{ root: classes.walletInput }}
                fullWidth
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <Typography className={classes.inputHelp}>
                {checkInputLengthExceed(name)
                    ? t('input_length_exceed_prompt', {
                          name: t('wallet_name').toLowerCase(),
                          length: WALLET_OR_PERSONA_NAME_MAX_LEN,
                      })
                    : null}
            </Typography>
            <div className={classes.checkLabel}>
                <FormControlLabel
                    control={
                        <Checkbox checked={checkSave} onChange={onCheckboxChange} name="checksave" color="primary" />
                    }
                    label={t('mnemonic_saved')}
                />
            </div>
        </>
    )

    const tabProps: AbstractTabProps = {
        height: 240,
        tabs: [
            {
                label: t('mnemonic_words'),
                children: (
                    <>
                        <div className={classes.mnemonic}>
                            <Typography className={classes.inputTitle}>
                                {t('mnemonic_words')}
                                <span>*</span>
                            </Typography>
                            <InputBase
                                classes={{ root: classes.mnemonicInput, input: classes.mnemonicInner }}
                                fullWidth
                                required
                                value={seed}
                                onChange={(e) => onChangeSeed(e.target.value)}
                                multiline
                                rows={2}
                            />
                            <img
                                src={ToolIconURLs.copy.image}
                                onClick={onCopyMnemonic}
                                className={classes.iconCopy}
                                style={{ cursor: 'pointer' }}
                                alt=""
                            />
                        </div>
                        {f}
                    </>
                ),
            },
            {
                label: t('private_key'),
                children: (
                    <div>
                        <Typography className={classes.inputTitle}>
                            {t('private_key')}
                            <span>*</span>
                        </Typography>
                        <InputBase
                            classes={{ root: classes.privateInput }}
                            fullWidth
                            readOnly
                            required
                            value={seed}
                            onChange={(e) => onChangeSeed(e.target.value)}
                            multiline
                            rows={2}
                        />
                        {f}
                    </div>
                ),
                sx: { display: 'flex', p: 0 },
            },
        ],
        state,
        // height: 200,
    }

    const content = (
        <>
            <section className={classes.section}>
                <Typography className={classes.inputTitle}>{t('wallet_address')}</Typography>
                <Typography className={classes.address}>{address}</Typography>
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
                    networkPrefix,
                })
            }
            if (state[0] === 1) {
                if (!rawValidate) throw new Error(t('import_failed'))
                await WalletRPC.importNewWallet({
                    name,
                    address: address || '',
                    _private_key_: seed,
                    networkPrefix,
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
        <DebounceButton fullWidth variant="contained" disabled={!checkNext()} onClick={onSubmit}>
            {t('create')}
        </DebounceButton>
    )

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                primary={t('plugin_wallet_on_create')}
                size="large"
                content={content}
                footer={footer}
            />
        </DashboardDialogCore>
    )
}
