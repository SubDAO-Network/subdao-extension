import { SvgIcon, SvgIconProps } from '@material-ui/core'

export function RightArrowIcon(props: SvgIconProps) {
    return (
        <SvgIcon {...props}>
            <svg width={24} height={24} xmlns="http://www.w3.org/2000/svg" {...props}>
                <g fill="none" fillRule="evenodd">
                    <path d="M0 0h24v24H0z" />
                    <g fill="#ADAFC2" fillOpacity={0.6} fillRule="nonzero">
                        <path d="M8.619 18.634a.59.59 0 01-.588.587H6.59a.59.59 0 01-.588-.587V5.59a.59.59 0 01.588-.587H8.03a.59.59 0 01.588.587v13.044zM10.715 5.59c0-.323.212-.43.472-.236l8.612 6.414c.26.193.26.508 0 .701l-8.612 6.414c-.26.193-.472.087-.472-.237V5.59z" />
                    </g>
                </g>
            </svg>
        </SvgIcon>
    )
}
