import SimpleBarReact, { Props } from 'simplebar-react'
// material
import { Box, BoxProps } from '@material-ui/core'
import { alpha, styled } from '@material-ui/core/styles'

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  height: '100%',
  overflow: 'hidden',
}))

const SimpleBarStyle = styled(SimpleBarReact)(({ theme }) => ({
  maxHeight: '100%',
  '& .simplebar-scrollbar': {
    '&:before': {
      backgroundColor: alpha(theme.palette.grey[600], 0.48),
    },
    '&.simplebar-visible:before': {
      opacity: 1,
    },
  },
  '& .simplebar-track.simplebar-vertical': {
    width: 10,
  },
  '& .simplebar-track.simplebar-horizontal .simplebar-scrollbar': {
    height: 6,
  },
  '& .simplebar-mask': {
    zIndex: 'inherit',
  },
}))

// ----------------------------------------------------------------------

export default function Scrollbar({
  children,
  sx,
  ...other
}: BoxProps & Props) {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )

  if (isMobile) {
    return (
      <Box style={{ overflowX: 'auto', ...sx }} {...other}>
        {children}
      </Box>
    )
  }

  return (
    <RootStyle>
      <SimpleBarStyle timeout={500} clickOnTrack={false} style={sx} {...other}>
        {children}
      </SimpleBarStyle>
    </RootStyle>
  )
}
