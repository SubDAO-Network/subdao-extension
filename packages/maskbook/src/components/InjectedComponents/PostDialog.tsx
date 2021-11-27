import { useState, useCallback, useEffect } from 'react'
import {
    makeStyles,
    InputBase,
    Button,
    Typography,
    Box,
    Chip,
    Theme,
    DialogProps,
    Tooltip,
    CircularProgressProps,
    CircularProgress,
    DialogContent,
    DialogActions,
    experimentalStyled as styled,
} from '@material-ui/core'
import { CompositionEvent, MaskMessage } from '../../utils/messages'
import { useStylesExtends, or } from '../custom-ui-helper'
import type { Profile, Group } from '../../database'
import { useFriendsList, useCurrentIdentity, useMyIdentities } from '../DataSource/useActivatedUI'
import { currentImagePayloadStatus, debugModeSetting } from '../../settings/settings'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { activatedSocialNetworkUI } from '../../social-network'
import Services from '../../extension/service'
import { SelectRecipientsUI, SelectRecipientsUIProps } from '../shared/SelectRecipients/SelectRecipients'
import { ClickableChip } from '../shared/SelectRecipients/ClickableChip'
import {
    TypedMessage,
    extractTextFromTypedMessage,
    renderWithMetadataUntyped,
    makeTypedMessageText,
    isTypedMessageText,
} from '../../protocols/typed-message'
import { EthereumTokenType } from '../../web3/types'
import { isDAI, isOKB } from '../../web3/helpers'
import { PluginRedPacketTheme } from '../../plugins/RedPacket/theme'
import { useI18N } from '../../utils/i18n-next-ui'
import { RedPacketMetadataReader } from '../../plugins/RedPacket/helpers'
import { PluginUI } from '../../plugins/PluginUI'
import { Result } from 'ts-results'
import { ErrorBoundary } from '../shared/ErrorBoundary'
import { InjectedDialog } from '../shared/InjectedDialog'
import { DebugMetadataInspector } from '../shared/DebugMetadataInspector'
import { PluginStage } from '../../plugins/types'
import { Flags } from '../../utils/flags'
import { editActivatedPostMetadata, globalTypedMessageMetadata } from '../../protocols/typed-message/global-state'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base'
import { SteganographyTextPayload } from './SteganographyTextPayload'
import { useMaskbookTheme } from '../../utils/theme'

const useStyles = makeStyles({
    inputBox: {
        border: '1px solid #E5E5E5',
        background: '#F8F8F8',
        width: 408,
        height: 110,
        margin: '0 auto',
        paddingBottom: 6,
        boxSizing: 'border-box',
        marginBottom: 15,
    },
    MUIInputRoot: {
        flexDirection: 'column',
        padding: '12px 6px 6px 20px',
        boxSizing: 'border-box',
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '16px',
        color: '#212121',
    },
    MUIInputInput: {},
    sup: {
        paddingLeft: 2,
    },
})

const SelectTitle = styled(Typography)(({ theme }) => ({
    fontSize: '12px',
    color: 'rgba(33, 33, 33, 0.4)',
    marginBottom: theme.spacing(1),
    paddingRight: 6,
    fontWeight: 400,
}))

const InputLength = styled(Typography)(({ theme }) => ({
    fontSize: '14px',
    fontWeight: 400,
    textAlign: 'right',
    paddingRight: 6,
    span: {
        color: '#666666',
    },
}))

export interface PostDialogUIProps extends withClasses<never> {
    theme?: Theme
    open: boolean
    onlyMyself: boolean
    shareToEveryone: boolean
    imagePayload: boolean
    imagePayloadUnchangeable: boolean
    maxLength?: number
    availableShareTarget: Array<Profile | Group>
    currentShareTarget: Array<Profile | Group>
    currentIdentity: Profile | null
    postContent: TypedMessage
    postBoxButtonDisabled: boolean
    onPostContentChanged: (nextMessage: TypedMessage) => void
    onOnlyMyselfChanged: (checked: boolean) => void
    onShareToEveryoneChanged: (checked: boolean) => void
    onImagePayloadSwitchChanged: (checked: boolean) => void
    onFinishButtonClicked: () => void
    onCloseButtonClicked: () => void
    onSetSelected: SelectRecipientsUIProps['onSetSelected']
    DialogProps?: Partial<DialogProps>
    SelectRecipientsUIProps?: Partial<SelectRecipientsUIProps>
}
export function PostDialogUI(props: PostDialogUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { t } = useI18N()
    const isDebug = useValueRef(debugModeSetting)
    const [showPostMetadata, setShowPostMetadata] = useState(false)
    const defaultTheme = useMaskbookTheme()
    const PostContentLen = props.maxLength
    const onPostContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const newText = e.target.value
        const msg = props.postContent
        if (isTypedMessageText(msg)) props.onPostContentChanged(makeTypedMessageText(newText, msg.meta))
        else throw new Error('Not impled yet')
    }

    if (!isTypedMessageText(props.postContent)) return <>Unsupported type to edit</>
    const metadataBadge = [...PluginUI].flatMap((plugin) =>
        Result.wrap(() => {
            const knownMeta = plugin.postDialogMetadataBadge
            if (!knownMeta) return undefined
            return [...knownMeta.entries()].map(([metadataKey, tag]) => {
                return renderWithMetadataUntyped(props.postContent.meta, metadataKey, (r) => (
                    <Box
                        key={metadataKey}
                        sx={{
                            marginRight: 1,
                            marginTop: 1,
                            display: 'inline-block',
                        }}>
                        <Tooltip title={`Provided by plugin "${plugin.pluginName}"`}>
                            <Chip
                                onDelete={() => editActivatedPostMetadata((meta) => meta.delete(metadataKey))}
                                label={tag(r)}
                            />
                        </Tooltip>
                    </Box>
                ))
            })
        }).unwrapOr(null),
    )
    const pluginEntries = [...PluginUI].flatMap((plugin) =>
        Result.wrap(() => {
            const entries = plugin.postDialogEntries
            if (!entries) return null
            return entries.map((opt, index) => {
                return (
                    <ErrorBoundary subject={`Plugin "${plugin.pluginName}"`} key={plugin.identifier + ' ' + index}>
                        <ClickableChip
                            label={
                                <>
                                    {opt.label}
                                    {plugin.stage === PluginStage.Beta && <sup className={classes.sup}>(Beta)</sup>}
                                </>
                            }
                            onClick={opt.onClick}
                        />
                    </ErrorBoundary>
                )
            })
        }).unwrapOr(null),
    )
    return (
        <>
            <InjectedDialog
                theme={props.theme ?? defaultTheme}
                open={props.open}
                onClose={props.onCloseButtonClicked}
                title={t('post_dialog__title')}>
                <DialogContent>
                    {metadataBadge}
                    <div className={classes.inputBox}>
                        <InputBase
                            classes={{
                                root: classes.MUIInputRoot,
                                input: classes.MUIInputInput,
                            }}
                            autoFocus
                            value={props.postContent.content}
                            onChange={onPostContentChange}
                            fullWidth
                            multiline
                            rows={4}
                            placeholder={t('post_dialog__placeholder')}
                            inputProps={{ 'data-testid': 'text_textarea' }}
                        />
                        <InputLength>
                            {props.postContent.content.length}/<span>{PostContentLen}</span>
                        </InputLength>
                    </div>

                    <SelectTitle>Plugins(Experimental)</SelectTitle>
                    <Box
                        style={{ marginBottom: 10 }}
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                        }}>
                        {pluginEntries}
                    </Box>
                    <SelectTitle>{t('post_dialog__select_recipients_title')}</SelectTitle>
                    <Box
                        style={{ marginBottom: 10 }}
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                        }}>
                        <SelectRecipientsUI
                            items={props.availableShareTarget}
                            selected={props.currentShareTarget}
                            onSetSelected={props.onSetSelected}
                            {...props.SelectRecipientsUIProps}>
                            <ClickableChip
                                checked={props.shareToEveryone}
                                label={t('post_dialog__select_recipients_share_to_everyone')}
                                data-testid="_everyone_group_"
                                onClick={() => props.onShareToEveryoneChanged(!props.shareToEveryone)}
                            />
                            <ClickableChip
                                checked={props.onlyMyself}
                                label={t('post_dialog__select_recipients_only_myself')}
                                data-testid="_only_myself_group_"
                                onClick={() => props.onOnlyMyselfChanged(!props.onlyMyself)}
                            />
                        </SelectRecipientsUI>
                    </Box>

                    <SelectTitle>{t('post_dialog__more_options_title')}</SelectTitle>
                    <Box
                        style={{ marginBottom: 10 }}
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                        }}>
                        <ClickableChip
                            checked={props.imagePayload}
                            label={
                                <>
                                    {t('post_dialog__image_payload')}
                                    {Flags.image_payload_marked_as_beta && <sup className={classes.sup}>(Beta)</sup>}
                                </>
                            }
                            onClick={() => props.onImagePayloadSwitchChanged(!props.imagePayload)}
                            data-testid="image_chip"
                            disabled={props.imagePayloadUnchangeable}
                        />
                        {isDebug && (
                            <Chip label="Post metadata inspector" onClick={() => setShowPostMetadata((e) => !e)} />
                        )}
                        {showPostMetadata && (
                            <DebugMetadataInspector
                                onNewMetadata={(meta) => (globalTypedMessageMetadata.value = meta)}
                                onExit={() => setShowPostMetadata(false)}
                                meta={props.postContent.meta || new Map()}
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    {isTypedMessageText(props.postContent) && props.maxLength ? (
                        <CharLimitIndicator value={props.postContent.content.length} max={props.maxLength} />
                    ) : null}
                    <Button
                        variant="contained"
                        disabled={props.postBoxButtonDisabled}
                        onClick={props.onFinishButtonClicked}
                        data-testid="finish_button">
                        {t('post_dialog__button')}
                    </Button>
                </DialogActions>
            </InjectedDialog>
        </>
    )
}

export interface PostDialogProps extends Omit<Partial<PostDialogUIProps>, 'open'> {
    open?: [boolean, (next: boolean) => void]
    reason?: 'timeline' | 'popup'
    identities?: Profile[]
    onRequestPost?: (target: (Profile | Group)[], content: TypedMessage) => void
    onRequestReset?: () => void
    typedMessageMetadata?: ReadonlyMap<string, any>
}
export function PostDialog({ reason: props_reason = 'timeline', ...props }: PostDialogProps) {
    // network support
    const networkSupport = activatedSocialNetworkUI.injection.newPostComposition?.supportedOutputTypes
    const textOnly = networkSupport?.text === true && networkSupport.image === false
    const imageOnly = networkSupport?.image === true && networkSupport.text === false
    const imagePayloadButtonForzen = textOnly || imageOnly

    const { t, i18n } = useI18N()
    const [onlyMyselfLocal, setOnlyMyself] = useState(false)
    const onlyMyself = props.onlyMyself ?? onlyMyselfLocal
    const [shareToEveryoneLocal, setShareToEveryone] = useState(true)
    const shareToEveryone = props.shareToEveryone ?? shareToEveryoneLocal
    const typedMessageMetadata = or(props.typedMessageMetadata, useValueRef(globalTypedMessageMetadata))
    const [open, setOpen] = or(props.open, useState<boolean>(false)) as NonNullable<PostDialogProps['open']>

    //#region TypedMessage
    const [postBoxContent, setPostBoxContent] = useState<TypedMessage>(makeTypedMessageText('', typedMessageMetadata))
    useEffect(() => {
        if (typedMessageMetadata !== postBoxContent.meta)
            setPostBoxContent({ ...postBoxContent, meta: typedMessageMetadata })
    }, [typedMessageMetadata, postBoxContent])
    //#endregion
    //#region Share target
    const people = useFriendsList()
    const availableShareTarget = props.availableShareTarget || people
    const currentIdentity = or(props.currentIdentity, useCurrentIdentity())
    const [currentShareTarget, setCurrentShareTarget] = useState<(Profile | Group)[]>(() => [])
    //#endregion
    //#region Image Based Payload Switch
    const imagePayloadStatus = useValueRef(currentImagePayloadStatus[activatedSocialNetworkUI.networkIdentifier])
    const imagePayloadEnabled = imagePayloadStatus === 'true'
    const onImagePayloadSwitchChanged = or(
        props.onImagePayloadSwitchChanged,
        useCallback((checked) => {
            currentImagePayloadStatus[activatedSocialNetworkUI.networkIdentifier].value = String(checked)
        }, []),
    )
    //#endregion
    //#region callbacks
    const onRequestPost = or(
        props.onRequestPost,
        useCallback(
            async (target: (Profile | Group)[], content: TypedMessage) => {
                const [encrypted, token] = await Services.Crypto.encryptTo(
                    content,
                    target.map((x) => x.identifier),
                    currentIdentity!.identifier,
                    !!shareToEveryone,
                )
                const activeUI = activatedSocialNetworkUI
                // TODO: move into the plugin system
                const redPacketMetadata = RedPacketMetadataReader(typedMessageMetadata)
                if (imagePayloadEnabled || imageOnly) {
                    const isRedPacket = redPacketMetadata.ok
                    const isErc20 =
                        redPacketMetadata.ok &&
                        redPacketMetadata.val &&
                        redPacketMetadata.val.token &&
                        redPacketMetadata.val.token_type === EthereumTokenType.ERC20
                    const isDai = isErc20 && redPacketMetadata.ok && isDAI(redPacketMetadata.val.token?.address ?? '')
                    const isOkb = isErc20 && redPacketMetadata.ok && isOKB(redPacketMetadata.val.token?.address ?? '')

                    const relatedText = t('additional_post_box__steganography_post_pre', {
                        random: new Date().toLocaleString(),
                    })
                    activeUI.automation.nativeCompositionDialog?.appendText?.(relatedText, {
                        recover: false,
                    })
                    const img = await SteganographyTextPayload(
                        isRedPacket ? (isDai ? 'dai' : isOkb ? 'okb' : 'eth') : 'v2',
                        encrypted,
                    )
                    activeUI.automation.nativeCompositionDialog?.attachImage?.(img, {
                        recover: true,
                        relatedTextPayload: relatedText,
                    })
                } else {
                    let text = t('additional_post_box__encrypted_post_pre', { encrypted })
                    if (redPacketMetadata.ok) {
                        if (i18n.language?.includes('zh')) {
                            text = isTwitter(activeUI)
                                ? `用 #SubDAO @subdao_network 开启紅包 ${encrypted}`
                                : `用 #SubDAO 开启紅包 ${encrypted}`
                        } else {
                            text = isTwitter(activeUI)
                                ? `Claim this Red Packet with SubDAO extension @subdao_network ${encrypted}`
                                : `Claim this Red Packet with SubDAO extension ${encrypted}`
                        }
                    }
                    activeUI.automation.nativeCompositionDialog?.appendText?.(text, {
                        recover: true,
                    })
                }
                // This step write data on gun.
                // there is nothing to write if it shared with public
                if (!shareToEveryone) Services.Crypto.publishPostAESKey(token)
            },
            [currentIdentity, shareToEveryone, typedMessageMetadata, imagePayloadEnabled, t, i18n.language, imageOnly],
        ),
    )
    const onRequestReset = or(
        props.onRequestReset,
        useCallback(() => {
            setOpen(false)
            setOnlyMyself(false)
            setShareToEveryone(true)
            setPostBoxContent(makeTypedMessageText(''))
            setCurrentShareTarget([])
            globalTypedMessageMetadata.value = new Map()
        }, [setOpen]),
    )
    const onFinishButtonClicked = useCallback(() => {
        onRequestPost(onlyMyself ? [currentIdentity!] : currentShareTarget, postBoxContent)
        onRequestReset()
    }, [currentIdentity, currentShareTarget, onRequestPost, onRequestReset, onlyMyself, postBoxContent])
    const onCloseButtonClicked = useCallback(() => {
        setOpen(false)
    }, [setOpen])
    //#endregion
    //#region My Identity
    const identities = useMyIdentities()
    useEffect(() => {
        return MaskMessage.events.compositionUpdated.on(({ reason, open, content, options }: CompositionEvent) => {
            if (reason !== props_reason || identities.length <= 0) return
            setOpen(open)
            if (content) setPostBoxContent(content)
            if (options?.onlyMySelf) setOnlyMyself(true)
            if (options?.shareToEveryOne) setShareToEveryone(true)
        })
    }, [identities.length, props_reason, setOpen])

    const onOnlyMyselfChanged = or(
        props.onOnlyMyselfChanged,
        useCallback((checked: boolean) => {
            setOnlyMyself(checked)
            checked && setShareToEveryone(false)
        }, []),
    )
    const onShareToEveryoneChanged = or(
        props.onShareToEveryoneChanged,
        useCallback((checked: boolean) => {
            setShareToEveryone(checked)
            checked && setOnlyMyself(false)
        }, []),
    )
    //#endregion

    //#region Red Packet
    // TODO: move into the plugin system
    const hasRedPacket = RedPacketMetadataReader(postBoxContent.meta).ok
    const theme = hasRedPacket ? PluginRedPacketTheme : undefined
    const mustSelectShareToEveryone = hasRedPacket && shareToEveryone

    useEffect(() => {
        if (mustSelectShareToEveryone) onShareToEveryoneChanged(true)
    }, [mustSelectShareToEveryone, onShareToEveryoneChanged])
    //#endregion
    const isPostButtonDisabled = !(() => {
        const text = extractTextFromTypedMessage(postBoxContent)
        if (text.ok && text.val.length > 560) return false
        return onlyMyself || shareToEveryoneLocal ? text.val : currentShareTarget.length && text
    })()

    return (
        <PostDialogUI
            theme={theme}
            shareToEveryone={shareToEveryoneLocal}
            onlyMyself={onlyMyself}
            availableShareTarget={availableShareTarget}
            imagePayload={!textOnly && (imageOnly || imagePayloadEnabled)}
            imagePayloadUnchangeable={imagePayloadButtonForzen}
            currentIdentity={currentIdentity}
            currentShareTarget={currentShareTarget}
            postContent={postBoxContent}
            postBoxButtonDisabled={isPostButtonDisabled}
            maxLength={500}
            onSetSelected={setCurrentShareTarget}
            onPostContentChanged={setPostBoxContent}
            onShareToEveryoneChanged={onShareToEveryoneChanged}
            onOnlyMyselfChanged={onOnlyMyselfChanged}
            onImagePayloadSwitchChanged={onImagePayloadSwitchChanged}
            onFinishButtonClicked={onFinishButtonClicked}
            onCloseButtonClicked={onCloseButtonClicked}
            {...props}
            open={open}
        />
    )
}
export function CharLimitIndicator({ value, max, ...props }: CircularProgressProps & { value: number; max: number }) {
    const displayLabel = max - value < 40
    const normalized = Math.min((value / max) * 100, 100)
    const style = { transitionProperty: 'transform,width,height,color' } as React.CSSProperties
    return (
        <Box
            sx={{
                position: 'relative',
                display: 'inline-flex',
                marginLeft: 1,
                marginRight: 1,
            }}>
            <CircularProgress
                variant="determinate"
                value={normalized}
                color={displayLabel ? 'secondary' : 'primary'}
                size={displayLabel ? void 0 : 16}
                {...props}
                style={value >= max ? { color: 'red', ...style, ...props.style } : { ...style, ...props.style }}
            />
            {displayLabel ? (
                <Box
                    sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <Typography variant="caption" component="div" color="textSecondary">
                        {max - value}
                    </Typography>
                </Box>
            ) : null}
        </Box>
    )
}
