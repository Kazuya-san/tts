import { forwardRef } from 'react'
// material
import { IconButton, IconButtonProps } from '@material-ui/core'
//

// ----------------------------------------------------------------------

// eslint-disable-next-line no-use-before-define
const MIconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, ...other }, ref) => (
    <IconButton ref={ref} {...other}>
      {children}
    </IconButton>
  )
)
MIconButton.displayName = 'MIconButton'

export default MIconButton
