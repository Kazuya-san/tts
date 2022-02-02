import Image from 'next/image'
import { useCity } from '../../../utils/city/city-context'
import Link from '../link/link'
import styles from './category-card.module.scss'

type CategoryCardProps = {
  category: {
    id: number
    name: string
    sub_categories: {
      id: number
    }[]
  }
  disableLink?: boolean
}

function CategoryCard({ category, disableLink }: CategoryCardProps) {
  const { zipAndCity } = useCity()

  return (
    <Link
      className={styles.categoryCard}
      href={
        disableLink
          ? '/'
          : zipAndCity
          ? `/posts/${zipAndCity.city.name.toLowerCase()}/${
              zipAndCity.city.alt_id
            }/${category.name.toLowerCase()}/1`
          : '/'
      }
      variant="body2"
    >
      <Image
        className={styles.categoryCard__icon}
        alt={`${category.name} Icon`}
        src={`https://uploads.1stkare.com/category-icons/${category.id}.svg`}
        layout="fixed"
        width={48}
        height={48}
        sizes="48px"
        priority
      />

      <span className={styles.categoryCard__name}>{category.name}</span>
    </Link>
  )
}

export default CategoryCard
