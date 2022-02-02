import { Box } from '@material-ui/core'

import styles from './form-card.module.scss'

type FormCardProps = {
  item: {
    id: any
    name: string
  }
  selectedItem?: any
}

function FormCard({ item, selectedItem }: FormCardProps) {
  return (
    <Box
      className={`${styles.formCard} ${
        selectedItem === item?.id ? styles.formCard__selected : ''
      }`}
    >
      <span className={styles.formCard__name}>{item.name}</span>
    </Box>
  )
}

export default FormCard
