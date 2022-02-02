import {
  Button,
  Card,
  Container,
  Divider,
  Grid,
  IconButton,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { Call, Delete, Done, Edit } from '@material-ui/icons'
import clsx from 'clsx'
import Image from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { ChevronRight } from 'react-feather'
import ReactHtmlParser from 'react-html-parser'
import ContentLinkIcon from '../../assets/icons/post-detail/content-link.svg'
import DocIcon from '../../assets/icons/post-detail/doc.svg'
import DollarIcon from '../../assets/icons/_shared/post-card/dollar.svg'
import LocationIcon from '../../assets/icons/_shared/post-card/location.svg'
import PhoneCallIcon from '../../assets/icons/_shared/post-card/phone-call.svg'
import DollarSignIcon from '../../assets/icons/_shared/seller-card/dollar-sign.svg'
import MapPinIcon from '../../assets/icons/_shared/seller-card/map-pin.svg'
import NationalImg from '../../assets/images/post-card/national.png'
import SponsorImg from '../../assets/images/post-card/sponsor.png'
import SubscribeImg from '../../assets/images/post-card/subscribe.png'
import type {
  Categories as CategoryType,
  Cities as CityType,
  Files as FileType,
  Possible_Values as PossibleValueType,
  Posts as PostType,
  Post_Attachments as PostAttachmentType,
  Post_Attributes as PostAttributeType,
  Post_Prices as PostPriceType,
  Properties as PropertyType,
  Sub_Categories as SubCategoryType,
} from '../../generated/graphql'
import { usePostCard__DeletePostMutation } from '../../generated/graphql'
import { BusinessSize } from '../../utils/auth/types'
import { useUser } from '../../utils/user/user-context'
import type { SellerDetailProps } from '../seller-detail/seller-detail'
import Footer from '../_shared/footer/footer'
import Header from '../_shared/header/header'
import Link from '../_shared/link/link'
import styles from './post-detail.module.scss'

export type PostDetailProps = {
  post: Pick<
    PostType,
    | 'id'
    | 'alt_id'
    | 'posted_by'
    | 'title'
    | 'years_of_experience'
    | 'detail'
    | 'promotion_status'
    | 'post_attribute'
  > & {
    user: Omit<SellerDetailProps['user'], 'zip_code'> & {
      zip_code: { city: Pick<CityType, 'id' | 'name' | 'state_code'> }
    }
    post_attachments: (Pick<PostAttachmentType, 'id'> & {
      file: Pick<FileType, 'url' | 'name'>
    })[]
    post_prices: Pick<PostPriceType, 'id' | 'price' | 'detail'>[]
    sub_category: Pick<SubCategoryType, 'id' | 'name'> & {
      category: Pick<CategoryType, 'id' | 'name'> & {
        sub_categories: Pick<SubCategoryType, 'id'>[]
      }
    }
    // @ts-ignore
    post_attributes: (Pick<PostAttributeType, 'id'> & {
      // @ts-ignore
      possible_value: Pick<PossibleValueType, 'name'> & {
        property: Pick<PropertyType, 'name' | 'order'>
      }
    })[]
  }
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
}))

function PostDetail({ post }: PostDetailProps) {
  const classes = useStyles()
  const { user: me } = useUser()
  const possibleAttributes = post?.post_attribute?.possible_value || {}

  const router = useRouter()
  const { user = {} as any, post_prices: prices = [] } = post

  const deletePost = usePostCard__DeletePostMutation()[1]
  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost({ post_id: post.id })
        .then(() =>
          router.prefetch('/seller/[seller_id]', `/seller/${user.alt_id}`, {
            priority: true,
          })
        )
        .then(() => router.push(`/seller/${user.alt_id}`))
    }
  }, [deletePost, post.id, user.alt_id])

  return (
    <>
      <Header />
      <Container>
        <div className={classes.root}>
          <div className={styles.postDetail__postCategory}>
            <Link href={`/?stay=1`} variant="body1" color="textSecondary">
              {user.zip_code?.city.name}
            </Link>
            <ChevronRight fontSize="small" />
            <Link
              href={`/posts/${user.zip_code?.city.name.toLowerCase()}/${
                user.zip_code?.city.alt_id
              }/${post.sub_category?.category.name.toLowerCase()}/1`}
              variant="body1"
              color="textSecondary"
            >
              {post.sub_category?.category.name}
            </Link>
            <ChevronRight fontSize="small" />
            <Link
              href={`/posts/${user.zip_code?.city.name.toLowerCase()}/${
                user.zip_code?.city.alt_id
              }/${post.sub_category?.name.toLowerCase()}/1`}
              variant="body1"
              color="textSecondary"
            >
              {post.sub_category?.name}
            </Link>
          </div>
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <div className={styles.postDetail__upper_section}>
                <div className={styles.postDetail__imageHolder}>
                  <NextLink href={`/seller/${user.alt_id}`} passHref>
                    <Image
                      className="postDetail__seller-intro__profile-image"
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
                <div className={styles.postDetail_info_section}>
                  <div
                    className={styles.postDetail_user_info_promotion_wrapper}
                  >
                    <div className={styles.postDetail_user_info_wrapper}>
                      <Typography
                        className={styles.postDetail_user_info_text}
                        variant="h4"
                        component="h1"
                      >
                        {post.title}
                      </Typography>

                      <NextLink href={`/seller/${user.alt_id}`}>
                        <Typography
                          color="textSecondary"
                          component="a"
                          className={styles.postDetail_user_name_text}
                        >
                          {user.business_size === BusinessSize.INDIVIDUAL
                            ? user.full_name
                            : user.business_name}
                        </Typography>
                      </NextLink>
                    </div>
                    {post.promotion_status &&
                    (post.promotion_status === 1 ||
                      post.promotion_status === 2 ||
                      post.promotion_status === 3) ? (
                      <div className={styles.postCard__promotionStatus}>
                        {post.promotion_status === 1 ? (
                          <div className={styles.postDetail_promotion_wrapper}>
                            <div className={styles.postDetail__promotionImg}>
                              <Image
                                alt="SponsorImg"
                                src={SponsorImg}
                                width={70}
                                height={70}
                              />
                            </div>
                            <div className={styles.postCard_badge_sponsored}>
                              <span>SPONSORED</span>
                            </div>
                          </div>
                        ) : post.promotion_status === 2 ? (
                          <div className={styles.postDetail_promotion_wrapper}>
                            <div className={styles.postDetail__promotionImg}>
                              <Image
                                alt="SubscribeImg"
                                src={SubscribeImg}
                                width={70}
                                height={70}
                              />
                            </div>
                            <div className={styles.postCard_badge_subscribed}>
                              <span>SPONSORED</span>
                            </div>
                          </div>
                        ) : post.promotion_status === 3 ? (
                          <div className={styles.postDetail_promotion_wrapper}>
                            <div className={styles.postDetail__promotionImg}>
                              <Image
                                alt="NationalImg"
                                src={NationalImg}
                                width={70}
                                height={70}
                              />
                            </div>
                            <div className={styles.postCard_badge_national}>
                              <span>NATIONAL</span>
                            </div>
                          </div>
                        ) : (
                          ''
                        )}
                      </div>
                    ) : null}
                  </div>
                  <Divider />
                  <div
                    className={styles.postDetail_user_address_price_msg_wrapper}
                  >
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
                        <Typography color="textSecondary">
                          {prices.length > 1 ? (
                            <>
                              <span
                                className={styles.postCard__colorTextSecondary}
                              >
                                {prices.reduce(
                                  (a, c) => (a < c.price ? a : c.price),
                                  Infinity
                                )}{' '}
                                /hr
                              </span>
                              <span> - </span>
                              <span
                                className={styles.postCard__colorTextSecondary}
                              >
                                {prices.reduce(
                                  (a, c) => (a > c.price ? a : c.price),
                                  0
                                )}{' '}
                                /hr
                              </span>
                            </>
                          ) : prices.length > 0 ? (
                            <span
                              className={styles.postCard__colorTextSecondary}
                            >
                              {prices[0].price} /hr
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

                        <Typography color="textSecondary">
                          {user.public_contact_address ? (
                            <span
                              className={styles.postCard__colorTextSecondary}
                            >
                              {user.public_contact_address}
                              <br />
                            </span>
                          ) : null}
                          <span className={styles.postCard__colorTextSecondary}>
                            {user.zip_code?.city.name},{' '}
                            {user.zip_code?.city.state_code}
                          </span>
                        </Typography>
                      </div>
                    </div>

                    <div className={styles.postDetail_msgbtn}>
                      {me?.id === user.id ? (
                        <>
                          <NextLink href={`/post/edit/${post.alt_id}`}>
                            <IconButton>
                              <Edit />
                            </IconButton>
                          </NextLink>
                          <IconButton onClick={handleDelete}>
                            <Delete />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          {user.public_phone ? (
                            <NextLink
                              href={`tel:${user.public_phone
                                .replace(/ /g, '')
                                .replace(/\-/g, '')}`}
                            >
                              <IconButton>
                                <Call color="primary" />
                              </IconButton>
                              <Image alt="Call" src={PhoneCallIcon} />
                            </NextLink>
                          ) : (
                            <span />
                          )}

                          <NextLink href={`/message/${user.alt_id}`}>
                            <Button variant="outlined">Message</Button>
                          </NextLink>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Grid>
            <Grid container spacing={0} style={{ marginTop: 60 }}>
              <Grid item xs={12} sm={12} md={12} lg={4}>
                <div className={styles.postDetail__bottom_left_section}>
                  {post?.post_attachments?.length === 0 ? (
                    <>
                      <Typography
                        variant="h6"
                        gutterBottom
                        className={styles.postDetail__description}
                      >
                        ATTACHMENTS
                      </Typography>
                      <Divider className="mb-2" />
                      <Grid
                        container
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={0}
                        style={{
                          marginTop: 30,
                        }}
                      >
                        {[1, 2, 3, 4].map((item) => (
                          <Grid
                            item
                            xs={6}
                            direction="row"
                            justifyContent="center"
                            alignItems="center"
                            style={{ display: 'flex' }}
                            key={item}
                          >
                            <div
                              className={
                                styles.postDetail__postAttachment_section
                              }
                            >
                              <a
                                key={item}
                                className={styles.postDetail__postAttachment}
                                href="https://www.cricbuzz.com/live-cricket-scores/42816/cv-vs-brsal-8th-match-bangladesh-premier-league-2022"
                                target="_blank"
                                rel="noopener noreferrer"
                                download="Doc 1"
                              >
                                <Image alt="Attachment" src={DocIcon} />
                                <Typography color="primary">
                                  Doc {item}
                                </Typography>
                              </a>
                            </div>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={8}>
                <div className={styles.postDetail__bottom_right_section}>
                  <div>
                    <Typography
                      variant="h6"
                      gutterBottom
                      className={styles.postDetail__description}
                    >
                      DESCRIPTION
                    </Typography>
                    <Divider className="mb-2" />
                    <Typography
                      className={clsx(styles.postDescription, 'mb-4')}
                      color="textSecondary"
                    >
                      {ReactHtmlParser(post.detail)}
                    </Typography>
                  </div>
                  {Object.keys(possibleAttributes).map((key) => (
                    <>
                      <div style={{ paddingBottom: '20px' }}>
                        <Typography
                          variant="h6"
                          gutterBottom
                          className={styles.postDetail__description}
                          key={key}
                        >
                          {key}
                        </Typography>
                        <Divider className="mb-2" />
                        <div className="flex">
                          <Done fontSize="small" color="secondary" />
                          <Typography className="ml-2" color="textSecondary">
                            {Object.keys(possibleAttributes[key])
                              .map((k) =>
                                typeof possibleAttributes[key][k] === 'boolean'
                                  ? `${k}`
                                  : `${k}: ${possibleAttributes[key][k]}`
                              )
                              .join(' - ')}
                          </Typography>
                        </div>
                      </div>
                    </>
                  ))}
                </div>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </Container>
      {/* <Container className={styles.postDetail} component="main" maxWidth="sm">
        <Card className={styles.postDetail__card}>
          <div className={clsx(styles.postDetail__sellerIntro, 'mb-5')}>
            <div className={styles.postDetail__imageHolder}>
              <NextLink href={`/seller/${user.alt_id}`} passHref>
                <Image
                  className="postDetail__seller-intro__profile-image"
                  alt={`${user.full_name}'s Avatar`}
                  src={
                    user.avatar?.url
                      ? user.avatar?.url
                      : `https://avatars.dicebear.com/api/initials/${encodeURIComponent(
                          user.full_name
                        )}.svg`
                  }
                  height={140}
                  width={140}
                  priority
                />
              </NextLink>
            </div>
            <div>
              <Typography
                className="mb-2"
                variant="h3"
                component="h1"
                style={{ lineHeight: 1 }}
              >
                {post.title}
              </Typography>

              <NextLink href={`/seller/${user.alt_id}`}>
                <Typography color="textSecondary" component="a">
                  {user.business_size === BusinessSize.INDIVIDUAL
                    ? user.full_name
                    : user.business_name}
                </Typography>
              </NextLink>

              <div className="flex items-center">
                <Image alt="Price Range" src={DollarSignIcon} />
                <Typography className="ml-2" color="textSecondary">
                  {prices.length > 1 ? (
                    <>
                      <span className={styles.postCard__colorTextSecondary}>
                        {prices.reduce(
                          (a, c) => (a < c.price ? a : c.price),
                          Infinity
                        )}{' '}
                        /hr
                      </span>
                      <span> - </span>
                      <span className={styles.postCard__colorTextSecondary}>
                        {prices.reduce(
                          (a, c) => (a > c.price ? a : c.price),
                          0
                        )}{' '}
                        /hr
                      </span>
                    </>
                  ) : prices.length > 0 ? (
                    <span className={styles.postCard__colorTextSecondary}>
                      {prices[0].price} /hr
                    </span>
                  ) : (
                    'N/A'
                  )}
                </Typography>
              </div>

              <div className="flex items-center">
                <Image alt="Price Range" src={MapPinIcon} />
                <Typography className="ml-2" color="textSecondary">
                  {user.public_contact_address ? (
                    <>
                      {user.public_contact_address}
                      <br />
                    </>
                  ) : null}
                  {user.zip_code?.city.name}, {user.zip_code?.city.state_code}
                </Typography>
              </div>

              {post.promotion_status &&
              (post.promotion_status === 1 ||
                post.promotion_status === 2 ||
                post.promotion_status === 3) ? (
                <span
                  className={clsx(styles.postCard__promotionStatus, 'mt-2')}
                >
                  {post.promotion_status === 1
                    ? 'SPONSORED'
                    : post.promotion_status === 2
                    ? 'SUBSCRIBED'
                    : post.promotion_status === 3
                    ? 'NATIONAL'
                    : ''}
                </span>
              ) : null}

              <div className="flex items-center mt-3">
                {me?.id === user.id ? (
                  <>
                    <NextLink href={`/post/edit/${post.alt_id}`}>
                      <IconButton>
                        <Edit />
                      </IconButton>
                    </NextLink>
                    <IconButton onClick={handleDelete}>
                      <Delete />
                    </IconButton>
                  </>
                ) : (
                  <>
                    {user.public_phone ? (
                      <NextLink
                        href={`tel:${user.public_phone
                          .replace(/ /g, '')
                          .replace(/\-/g, '')}`}
                      >
                        <IconButton>
                          <Call color="primary" />
                        </IconButton>
                        <Image alt="Call" src={PhoneCallIcon} />
                      </NextLink>
                    ) : (
                      <span />
                    )}
                    <NextLink href={`/message/${user.alt_id}`}>
                      <Button variant="outlined" color="primary">
                        Message
                      </Button>
                    </NextLink>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={clsx(styles.postDetail__postCategory, 'mb-4')}>
            <Link href={`/?stay=1`} variant="body1" color="textSecondary">
              {user.zip_code?.city.name}
            </Link>
            <ChevronRight fontSize="small" />
            <Link
              href={`/posts/${user.zip_code?.city.name.toLowerCase()}/${
                user.zip_code?.city.alt_id
              }/${post.sub_category?.category.name.toLowerCase()}/1`}
              variant="body1"
              color="textSecondary"
            >
              {post.sub_category?.category.name}
            </Link>
            <ChevronRight fontSize="small" />
            <Link
              href={`/posts/${user.zip_code?.city.name.toLowerCase()}/${
                user.zip_code?.city.alt_id
              }/${post.sub_category?.name.toLowerCase()}/1`}
              variant="body1"
              color="textSecondary"
            >
              {post.sub_category?.name}
            </Link>
          </div>

          <Typography variant="h6" gutterBottom>
            DESCRIPTION
          </Typography>
          <Divider className="mb-2" />
          <Typography
            className={clsx(styles.postDescription, 'mb-4')}
            color="textSecondary"
          >
            {ReactHtmlParser(post.detail)}
          </Typography>

          

          {post?.post_attachments?.length ? (
            <>
              <Typography variant="h6" gutterBottom>
                ATTACHMENTS
              </Typography>
              <Divider className="mb-2" />
              {post?.post_attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  className={styles.postDetail__postAttachment}
                  href={attachment.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={attachment.file.name}
                >
                  <Image alt="Attachment" src={ContentLinkIcon} />
                  <Typography color="primary">
                    {attachment.file.name}
                  </Typography>
                </a>
              ))}
            </>
          ) : null}

          {Object.keys(possibleAttributes).map((key) => (
            <>
              <Typography className="mt-3" variant="h6" gutterBottom key={key}>
                {key}
              </Typography>
              <div className="flex">
                <Done fontSize="small" color="secondary" />
                <Typography className="ml-2" color="textSecondary">
                  {Object.keys(possibleAttributes[key])
                    .map((k) =>
                      typeof possibleAttributes[key][k] === 'boolean'
                        ? `${k}`
                        : `${k}: ${possibleAttributes[key][k]}`
                    )
                    .join(' - ')}
                </Typography>
              </div>
            </>
          ))}
        </Card>
      </Container> */}

      <Footer />
    </>
  )
}

export default PostDetail
