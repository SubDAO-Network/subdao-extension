import { SvgIcon, SvgIconProps } from '@material-ui/core'

export function DoneIcon(props: SvgIconProps) {
    return (
        <SvgIcon {...props}>
            <svg width={32} height={32} {...props}>
                <path
                    d="M15.98.012c8.82 0 15.969 7.15 15.969 15.969 0 8.819-7.15 15.968-15.968 15.968-8.82 0-15.969-7.15-15.969-15.968C.012 7.16 7.162.012 15.981.012zm-2.805 20.6l-3.39-3.39a1.597 1.597 0 10-2.258 2.257l4.517 4.518a1.597 1.597 0 002.258 0l11.29-11.292a1.597 1.597 0 10-2.257-2.257l-10.162 10.16.002.003z"
                    fill="#52C41A"
                    fillRule="nonzero"
                />
            </svg>
        </SvgIcon>
    )
}
