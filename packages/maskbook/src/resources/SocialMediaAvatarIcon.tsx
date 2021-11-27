import { SvgIcon, SvgIconProps } from '@material-ui/core'

export function SocialMediaAvatarIcon(props: SvgIconProps) {
    return (
        <SvgIcon {...props}>
            <svg width={24} height={24} {...props}>
                <path
                    d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0zm2.937 12H9.062c-.989 0-1.866.55-2.179 1.368l-.765 2A1.767 1.767 0 006 16c0 1.105 1.028 2 2.296 2h7.407c.247 0 .492-.035.726-.103 1.203-.349 1.854-1.482 1.453-2.53l-.766-2c-.313-.816-1.19-1.367-2.179-1.367zM12 5a3 3 0 100 6 3 3 0 000-6z"
                    fill="#5C5F85"
                    fillRule="evenodd"
                    fillOpacity={0.5}
                />
            </svg>
        </SvgIcon>
    )
}
