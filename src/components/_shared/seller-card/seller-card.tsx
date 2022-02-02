import { Chip, styled } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import Image from 'next/image'
import NextLink from 'next/link'
import DollarIcon from '../../../assets/icons/_shared/post-card/dollar.svg'
import LocationIcon from '../../../assets/icons/_shared/post-card/location.svg'
import type {
  Cities as CityType,
  Files as FileType,
  Post_Prices as PostPriceType,
  Users as UserType,
} from '../../../generated/graphql'
import { useUser } from '../../../utils/user/user-context'
import Link from '../link/link'
import styles from './seller-card.module.scss'
import { useRouter } from 'next/router'


export type SellerCardProps = {
  user: Pick<
    UserType,
    | 'id'
    | 'email'
    | 'public_contact_address'
    | 'public_phone'
    | 'full_name'
    | 'business_name'
    | 'business_size'
    | 'last_seen'
  > & {
    avatar: Pick<FileType, 'url'>
    zip_code: { city: Pick<CityType, 'name' | 'state_code'> }
  }
  prices: Pick<PostPriceType, 'id' | 'price'>[]
}

const ChipStyle = styled(Chip)(({ theme }) => ({
  fontSize: 12,
  borderRadius: 9,
  backgroundColor: 'rgba(149, 124, 252, 0.2)',
  color: '#0844CC',
  fontWeight: 500,
  marginRight: 10,
  '.MuiChip-label': {
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 10,
    paddingBottom: 10,
  },
}))

function SellerCard({ user, prices }: SellerCardProps) {
  const router = useRouter()
  const { user: me } = useUser()
  const { seller_id } = router.query
  //console.log(router.query)

  //console.log(user)
  
  return (
    <>
      <div className={styles.sellerCard__upper_section}>
        <div className={styles.sellerCard__imageHolder}>
          <NextLink href={`/seller/${seller_id}`} passHref>
            <Image
              alt={`${user.full_name}'s Avatar`}
              src={
                user.avatar?.url
                  ? user.avatar?.url
                  : `https://avatars.dicebear.com/api/initials/${encodeURIComponent(
                      user.full_name
                    )}.svg`
              }
              height={263}
              width={263}
              priority
            />
          </NextLink>
        </div>
        <div className={styles.sellerCard_info_section}>
          <div className={styles.sellerCard_info_section}>
            <div className={styles.sellerCard_user_info_promotion_wrapper}>
              <div className={styles.sellerCard_user_info_wrapper}>
                <Typography
                  className={styles.sellerCard_user_info_text}
                  variant="h4"
                  component="h1"
                >
                  <Link href={`/seller/${seller_id}`} variant="h5">
                    {user.full_name}
                  </Link>
                </Typography>

                <Typography
                  variant="body1"
                  color="textSecondary"
                  className={styles.sellerCard_user_name_text}
                >
                  {user.business_name}
                </Typography>
              </div>
            </div>
            <Divider />
            <div className={styles.sellerCard_user_address_price_msg_wrapper}>
              <div className={styles.postCard__location_price_wrapper}>
                <div className={styles.postCard__price_wrapper}>
                  <div className={styles.postCard__price_svg_wrapper}>
                    <Image
                      alt="Price Range"
                      src={DollarIcon}
                      width={20}
                      height={20}
                    />
                  </div>

                  <Typography variant="body1" color="textPrimary">
                    {prices.length > 1 ? (
                      <>
                        <span className={styles.postCard__colorTextSecondary}>
                          {prices.reduce(
                            (a, c) => (a < c.price ? a : c.price),
                            Infinity
                          )}
                          $/hr
                        </span>
                        <span> - </span>
                        <span className={styles.postCard__colorTextSecondary}>
                          {prices.reduce(
                            (a, c) => (a > c.price ? a : c.price),
                            0
                          )}
                          $/hr
                        </span>
                      </>
                    ) : prices.length > 0 ? (
                      <span className={styles.postCard__colorTextSecondary}>
                        {prices[0].price} $/hr
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </Typography>
                </div>
                <div className={styles.postCard__location_wrapper}>
                  <div className={styles.postCard__location_svg_wrapper}>
                    <Image
                      alt="Location"
                      src={LocationIcon}
                      width={20}
                      height={20}
                    />
                  </div>
                  <Typography variant="body1" color="textPrimary">
                    {user.public_contact_address ? (
                      <span className={styles.postCard__colorTextSecondary}>
                        {user.public_contact_address}
                        <br />
                      </span>
                    ) : null}
                    <span className={styles.postCard__colorTextSecondary}>
                      {user.zip_code.city.name}, {user.zip_code.city.state_code}
                    </span>
                  </Typography>
                </div>
              </div>
              {/* <Box display="flex" flexWrap="wrap">
                  <ChipStyle key={1} label="GED" />
                  <ChipStyle key={2} label="Highschool" />
                </Box> */}
              {/* <div className={styles.sellerCard__chip}>
                  <span>GED</span>
                  <span>Highscoole</span>
                </div> */}

              <div className={styles.sellerCard_msgbtn}>
                {!me || me.id !== user.id ? (
                  <NextLink href={`/message/${seller_id}`} passHref>
                    <Button variant="outlined">Message</Button>
                  </NextLink>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className={styles.sellerCard}>
        <div className={styles.sellerCard__top}>
          <div className={styles.sellerCard__avatar}>
            <NextLink href={`/seller/${user.id}`} passHref>
              <Image
                alt={`${user.full_name}'s Avatar`}
                src={
                  user.avatar?.url
                    ? user.avatar?.url
                    : `https://avatars.dicebear.com/api/initials/${encodeURIComponent(
                        user.full_name
                      )}.svg`
                }
                layout="fill"
                sizes="96px"
                objectFit="cover"
                priority
              />
            </NextLink>
          </div>

          <div className={styles.sellerCard__titles}>
            <Link href={`/seller/${user.id}`} variant="h5">
              {user.full_name}
            </Link>

            <Typography variant="body1" color="textSecondary">
              {user.business_name}
            </Typography>
          </div>
        </div>

        {!me || me.id !== user.id ? (
          <NextLink href={`/message/${user.id}`} passHref>
            <Button
              variant="contained"
              size="large"
              color="primary"
              style={{ width: '100%' }}
            >
              MESSAGE
            </Button>
          </NextLink>
        ) : null}

        <Divider style={{ width: '100%' }} />

        <div className={styles.sellerCard__infoList}>
          <div className={styles.sellerCard__infoItem}>
            <Image alt="Price Range" src={DollarSignIcon} />

            <Typography variant="body1" color="textPrimary">
              {prices.length > 1 ? (
                <>
                  <span className={styles.postCard__colorText}>
                    {prices.reduce(
                      (a, c) => (a < c.price ? a : c.price),
                      Infinity
                    )}{' '}
                    $/hr
                  </span>
                  <span> - </span>
                  <span className={styles.postCard__colorText}>
                    {prices.reduce((a, c) => (a > c.price ? a : c.price), 0)}{' '}
                    $/hr
                  </span>
                </>
              ) : prices.length > 0 ? (
                <span className={styles.postCard__colorText}>
                  {prices[0].price} $/hr
                </span>
              ) : (
                'N/A'
              )}
            </Typography>
          </div>
          <div className={styles.sellerCard__infoItem}>
            <Image alt="Price Range" src={MapPinIcon} />

            <Typography variant="body1" color="textPrimary">
              {user.public_contact_address ? (
                <>
                  {user.public_contact_address}
                  <br />
                </>
              ) : null}
              {user.zip_code.city.name}, {user.zip_code.city.state_code}
            </Typography>
          </div>
          {user.public_phone ? (
            <div className={styles.sellerCard__infoItem}>
              <Image alt="Price Range" src={AlignLeftIcon} />

              <a
                href={`tel:${user.public_phone
                  .replace(/ /g, '')
                  .replace(/\-/g, '')}`}
              >
                <Typography variant="body1" color="primary">
                  {user.public_phone}
                </Typography>
              </a>
            </div>
          ) : null}
        </div>
      </div> */}
    </>
  )
}

export default SellerCard
