import { SvgIcon, SvgIconProps } from '@material-ui/core'

export function LeftArrowIcon(props: SvgIconProps) {
    return (
        <SvgIcon {...props}>
            <svg width={24} height={24} {...props}>
                <g fill="none" fillRule="evenodd">
                    <path d="M24 0H0v24h24z" />
                    <g fill="#ADAFC2" fillOpacity={0.6} fillRule="nonzero">
                        <path d="M15.381 18.634a.59.59 0 00.588.587h1.441a.59.59 0 00.588-.587V5.59a.59.59 0 00-.588-.587H15.97a.59.59 0 00-.588.587v13.044zM13.285 5.59c0-.323-.212-.43-.472-.236l-8.612 6.414c-.26.193-.26.508 0 .701l8.612 6.414c.26.193.472.087.472-.237V5.59z" />
                    </g>
                </g>
            </svg>
        </SvgIcon>
    )
}
