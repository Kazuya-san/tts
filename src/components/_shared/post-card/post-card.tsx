import { Box, Chip, styled, TextField } from '@material-ui/core'
import Divider from '@material-ui/core/Divider'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import clsx from 'clsx'
//@ts-ignore
import flatten from 'flat'
import Image from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { useCallback, useEffect, useState } from 'react'
import {
  useSendMessageMutation,
  useCreateRoomForUserMutation,
  useGetRoomForUserQuery,
} from '../../../generated/graphql'

import { useUser } from '../../../utils/user/user-context'
import ReactHtmlParser from 'react-html-parser'
import chatIcon from '../../../assets/icons/_shared/post-card/chat.svg'
import DollarIcon from '../../../assets/icons/_shared/post-card/dollar.svg'
import EditIcon from '../../../assets/icons/_shared/post-card/edit.svg'
import LocationIcon from '../../../assets/icons/_shared/post-card/location.svg'
import PhoneCallIcon from '../../../assets/icons/_shared/post-card/phone-call.svg'
import TrashIcon from '../../../assets/icons/_shared/post-card/trash.svg'
import NationalImg from '../../../assets/images/post-card/national.png'
import sendEmail from "../../../utils/email/sendEmail";
import SponsorImg from '../../../assets/images/post-card/sponsor.png'
import SubscribeImg from '../../../assets/images/post-card/subscribe.png'
import Modal from '@material-ui/core/Modal';
import type {
  Categories as CategoryType,
  Files as FileType,
  Posts as PostType,
  Post_Prices as PostPriceType,
  Sub_Categories as SubCategoryType,
  Users as UserType,
} from '../../../generated/graphql'
import { usePostCard__DeletePostMutation } from '../../../generated/graphql'
import { BusinessSize } from '../../../utils/auth/types'
import { useCity } from '../../../utils/city/city-context'
import Link from '../link/link'
import styles from './post-card.module.scss'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};


const useStyles = makeStyles((theme) => ({
  input: {
    '& .MuiOutlinedInput-notchedOutline': {
      background: 'rgba(8, 68, 294, 0.07)',
      borderColor: 'rgba(8, 68, 294, 0.07)',
      borderRadius: 18,
    },
  },
}))

// @ts-ignore
type CommonInPostModes = Pick<PostType, 'id' | 'title' | 'alt_id'> & {
  user: Pick<
    UserType,
    | 'id'
    | 'alt_id'
    | 'email'
    | 'public_phone'
    | 'full_name'
    | 'business_name'
    | 'business_size'
  > & {
    avatar: Pick<FileType, 'url'>
  }
  post_prices: Pick<PostPriceType, 'price'>[]
  category_name: String
  category_id: String
  sub_category_name: String
  sub_category_id: String
  sub_category: Pick<SubCategoryType, 'id' | 'name'> & {
    category: Pick<CategoryType, 'id' | 'name'>
  }
  promotion_status: String | number
  tags: any
}

export type PostCardProps =
  | { mode: 'MINI'; post: CommonInPostModes; pageName: string }
  | {
      mode: 'LARGE'
      post: CommonInPostModes & { detail?: PostType['detail'] }
      pageName: string
    }
  | {
      mode: 'OWNER'
      post: CommonInPostModes & { detail?: PostType['detail'] }
      pageName: string
    }

const ChipStyle = styled(Chip)(({ theme }) => ({
  // padding: theme.spacing(2),
  // borderRadius: 5,
  fontSize: 12,
  borderRadius: 9,
  backgroundColor: 'rgba(149, 124, 252, 0.2)',
  color: '#0844CC',
  fontWeight: 500,
  '.MuiChip-label': {
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 10,
    paddingBottom: 10,
  },
  '@media (min-width: 1036px) and (max-width: 1279px)': {
    fontSize: 10,
  },
}))

function PostCard(props: PostCardProps) {
  const classes = useStyles()
  const [newMessage, setNewMessage] = useState('')
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [modalMsg, setModalMsg] = useState("Nothing to see here");
  const [alt_Id, setalt_Id] = useState('')
  const [roomCreated, setRoomCreated] = useState(false);
  const [{}, sendMessage] = useSendMessageMutation()
  const [{}, createRoom] = useCreateRoomForUserMutation()
  const [disabled, setdisabled] = useState(false)
  const [roomIDnew, setroomIDnew] = useState("");
  const { user, auth } = useUser(true)
  const { mode, post, pageName } = props
  const postUser = post.user
  //call get room for user
  const [room, refetchRoomForUser] = useGetRoomForUserQuery({
    variables: {
      user_id: postUser.id,
      my_id: user?.id,
    },
  })



  const router = useRouter()
  // const { user } = useUser()
  const { enqueueSnackbar } = useSnackbar()

  const [isDeleted, setIsDeleted] = useState(false)
  
  const deletePost = usePostCard__DeletePostMutation()[1]
  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost({ post_id: post.id })
        .then(() => {
          setIsDeleted(true)
          router.replace(router.asPath)
          enqueueSnackbar('Post was updated!', {
            variant: 'success',
          })
          // router.prefetch(router.basePath, router.asPath, { priority: true })
        })
        .catch(() => {
          enqueueSnackbar('Error updating post!', {
            variant: 'error',
          })
        })
    }
  }, [deletePost, post.alt_id, router])

  let [flattenTags, setFlattenTags] = useState<any>({})
  useEffect(() => {
    if (post.tags) {
      setFlattenTags(flatten(post.tags))
    }
    if (post?.post_attribute) {
      setFlattenTags(flatten(post.post_attribute.possible_value))
    }
  }, [post])

  const { zipAndCity } = useCity()
  if (!zipAndCity) {
    return null
  }

  if (isDeleted) {
    return null
  }


  const sendM = async () => {

    if(room.fetching == false)
    {
       console.log(postUser.alt_id);
    // console.log(room)
    const res = room;
    if(!auth.authUser && !auth.authUser.displayName) {
     enqueueSnackbar('Please login to send message', {
        variant: 'error',
      })
      return;
    }
    if(newMessage.length > 0){
    let roomIn: any;
    if((res.data?.rooms.length > 0 && res.data?.rooms[0].id) || roomCreated){
      //setalt_Id(res.data?.rooms[0].alt_id)
     //if(roomCreated) 

      //setRoomCreated(false);
      sendMessage({
        content: newMessage,
        user_id: user?.id,
        room_id: roomCreated ? roomIDnew : res.data?.rooms[0].id,
      }).then(res =>{
        if(res.data)
        {
          // console.log(res);
          //setModalMsg("Message Sent!")
          //handleOpen();
          const emailconfig =  {
            to: postUser.email,
            from: user.email,
            subject: 'New Message',
            text: `${user.full_name} sent you a message.`,
            html: `<strong>${user.full_name}</strong> sent you a message.`,
          }

          sendEmail(emailconfig);
           
          enqueueSnackbar('Message Sent!', {
            variant: 'success',
          })
    //alert("Msg Sent!")
        }else{
          //setModalMsg("Error Sending Message!")
          enqueueSnackbar('Error Sending Message!', {
            variant: 'error',
          })
          //handleOpen();
        }
      }
      ).catch(err =>{
        //alert("There was an Error"))
        //setModalMsg("There was an Error")
        //handleOpen();
        enqueueSnackbar('There was an Error', {
          variant: 'error',
        })
      })
    }else{
      console.log("creating room")
      roomIn = await createRoom({
        user_id: postUser.id,
        my_id: user?.id,
      })

      setRoomCreated(true);

      //console.log(roomIn);

     // setalt_Id(roomIn?.data?.insert_rooms?.returning[0].alt_id)

        sendMessage({
          content: newMessage,
          user_id: user?.id,
          room_id: roomIn?.data?.insert_rooms?.returning[0].id,
        }).then( res =>{
          if(res.data)
          {
            setroomIDnew(roomIn?.data?.insert_rooms?.returning[0].id);
            console.log(res);
            const emailconfig =  {
              to: postUser.email,
              from: user.email,
              subject: 'New Message',
              text: `${user.full_name} sent you a message.`,
              html: `<strong>${user.full_name}</strong> sent you a message.`,
            }
           
            sendEmail(emailconfig);
      enqueueSnackbar('Message Sent!', {
        variant: 'success',
      })
      //reload the page
      //router.replace(router.asPath)
          }else{
            //setModalMsg("Error Sending Message!")
            //handleOpen();
            enqueueSnackbar('Error Sending Message!', {
              variant: 'error',
            })
          }
        }
        ).catch(err =>{
          //setModalMsg("There was an Error")
          //handleOpen();
          enqueueSnackbar('There was an Error', {
            variant: 'error',
          })
        })
      // alert("Msg Sent!");
    }

  }else{
    //alert("Message can't be empty!")
    //setModalMsg("Message can't be empty!")
    //handleOpen();
    enqueueSnackbar('Message can\'t be empty!', {
      variant: 'error',
    })
  }

    setNewMessage("");
    }
  return;
  }

  return (
    <div>
      <div
        className={`${styles.postCard} ${
          styles[`postCard__mode-${mode}`]
        } ${pageName}`}
      >
        {post.promotion_status &&
        (post.promotion_status === 1 ||
          post.promotion_status === 2 ||
          post.promotion_status === 3) ? (
          <div className={`${styles[`postCard__promotionStatus__${mode}`]}`}>
            {post.promotion_status === 1 ? (
              <>
                <Image
                  alt="SponsorImg"
                  src={SponsorImg}
                  width={75}
                  height={90}
                />
                <div className={styles.postCard_badge_sponsored}>
                  <span>SPONSORED</span>
                </div>
              </>
            ) : post.promotion_status === 2 ? (
              <>
                <Image
                  alt="SubscribeImg"
                  src={SubscribeImg}
                  width={75}
                  height={90}
                />
                <div className={styles.postCard_badge_subscribed}>
                <span>SUBSCRIBE</span>
                </div>
              </>
            ) : post.promotion_status === 3 ? (
              <>
                <Image
                  alt="NationalImg"
                  src={NationalImg}
                  width={75}
                  height={90}
                />
                <div className={styles.postCard_badge_national}>
                  <span>NATIONAL</span>
                </div>
              </>
            ) : (
              ''
            )}
          </div>
        ) : null}

              <Link
                href={`/post/${post.title.toLowerCase()}/${post.alt_id}`}
                variant="body2"
                color="primary"
                style={mode === 'MINI' ? {} : { fontWeight: 'bold' }}
              >
        <div
          className={clsx(
            `${styles.postCard__bottomRow}`,
            `${pageName === 'seller-detail' && styles.postCard_sellerDetail}`,
            `${pageName === 'seller-post' && styles.postCard_sellerDetail_Edit}`
          )}
        >
          {pageName === 'post-list' && (
            <NextLink href={`/seller/${postUser.alt_id}`} passHref>
              <Image
                className={styles.postCard__avatar}
                alt={`${postUser.full_name}'s Avatar`}
                src={
                  postUser.avatar?.url
                    ? postUser.avatar?.url
                    : `https://avatars.dicebear.com/api/initials/${encodeURIComponent(
                        postUser.full_name
                      )}.svg`
                }
                layout="fixed"
                height={133}
                width={133}
                sizes="56px"
                objectFit="cover"
                priority
              />
            </NextLink>
          )}

          <div className={styles.postCard__bottomRowInfo}>
            <div className={styles.postCard__bottomRowInfo_link}>
              <Link
                href={`/seller/${postUser.alt_id}`}
                variant="body2"
                color="primary"
                style={mode === 'MINI' ? {} : { fontWeight: 'bold' }}
              >
                {postUser.business_size === BusinessSize.INDIVIDUAL
                  ? postUser.full_name
                  : postUser.business_name}
              </Link>
              {pageName === 'seller-detail' && (
                <div>
                  <div className={styles.postCard__category}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      className={styles.postCard__category_text}
                    >
                      {post.category_name
                        ? post.category_name
                        : post.sub_category?.category?.name}
                    </Typography>
                    <ChevronRightIcon fontSize="small" />
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      className={styles.postCard__category_text}
                    >
                      {post.sub_category_name
                        ? post.sub_category_name
                        : post.sub_category?.name}
                    </Typography>
                  </div>
                </div>
              )}
              {pageName === 'seller-post' && (
                <div>
                  {mode === 'OWNER' ? (
                    <div className={styles.postCard__editDeleteWrapper}>
                      <Link href={`/post/edit/${post.alt_id}`}>
                        <div className={styles.postCard__editIcon}>
                          <Image alt="Message" src={EditIcon} />
                        </div>
                      </Link>
                      <span
                        onClick={handleDelete}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className={styles.postCard__trashIcon}>
                          <Image alt="Message" src={TrashIcon} />
                        </div>
                      </span>
                    </div>
                  ) : (
                    <>
                      {postUser.public_phone ? (
                        <Link
                          href={`tel:${postUser.public_phone
                            .replace(/ /g, '')
                            .replace(/\-/g, '')}`}
                        >
                          <Image alt="Call" src={PhoneCallIcon} />
                        </Link>
                      ) : (
                        <span />
                      )}
                      <div className={styles.postCard__chatmsg}>
                        <TextField
                          id="outlined-basic"
                          label="Please Type a Message"
                          variant="outlined"
                          fullWidth={true}
                          InputProps={{ className: classes.input }}
                        />
                        <div onClick={sendM} className={styles.postCard__chatlink}>
                          <Link href={`/message/${postUser.id}`}>
                            <Image alt="chatIcon" src={chatIcon} />
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className={styles.postCard__location_price_wrapper}>
              <div className={styles.postCard__location_wrapper}>
                <div className={styles.postCard__location_svg_wrapper}>
                  <Image
                    alt="Location"
                    src={LocationIcon}
                    width={10}
                    height={10}
                  />
                </div>
                <Typography variant="body2" color="textSecondary">
                  <span className={styles.postCard__colorText}>
                    Adjuntas, PR
                  </span>
                </Typography>
              </div>
              <div className={styles.postCard__price_wrapper}>
                <div className={styles.postCard__price_svg_wrapper}>
                  <Image
                    alt="Price Range"
                    src={DollarIcon}
                    width={10}
                    height={10}
                  />
                </div>

                <Typography variant="body2" color="textSecondary">
                  {post.post_prices.length > 1 ? (
                    <>
                      <span className={styles.postCard__colorText}>
                        {post.post_prices.reduce(
                          (a, c) => (a < c.price ? a : c.price),
                          Infinity
                        )}{' '}
                        $/hr
                      </span>
                      <span> - </span>
                      <span className={styles.postCard__colorText}>
                        {post.post_prices.reduce(
                          (a, c) => (a > c.price ? a : c.price),
                          0
                        )}{' '}
                        $/hr
                      </span>
                    </>
                  ) : post.post_prices.length > 0 ? (
                    <span className={styles.postCard__colorText}>
                      {post.post_prices[0].price} $/hr
                    </span>
                  ) : (
                    'N/A'
                  )}
                </Typography>
              </div>
            </div>

            {(pageName === 'post-list' || pageName === 'seller-post') && (
              <div>
                <div className={styles.postCard__category}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    className={styles.postCard__category_text}
                  >
                    {post.category_name
                      ? post.category_name
                      : post.sub_category?.category?.name}
                  </Typography>
                  <ChevronRightIcon fontSize="small" />
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    className={styles.postCard__category_text}
                  >
                    {post.sub_category_name
                      ? post.sub_category_name
                      : post.sub_category?.name}
                  </Typography>
                </div>
              </div>
            )}
            <Box display="flex" flexWrap="wrap">
              {Object.keys(flattenTags)?.map((key) => (
                <>
                  {typeof flattenTags[key] === 'string' ? (
                    <ChipStyle
                      key={key}
                      label={flattenTags[key]}
                      // style={{
                      //   '.MuiChip-label': {
                      //     paddingLeft: 6,
                      //     paddingRight: 6,
                      //   },
                      // }}
                    />
                  ) : null}
                </>
              ))}

              {/* <Typography variant="caption">
              {Object.keys(flattenTags)?.map((key, index) => (
                <>
                  {typeof flattenTags[key] === 'string' ? (
                    <>{flattenTags[key]} | </>
                  ) : null}
                </>
              ))}
            </Typography> */}
            </Box>
          </div>
        </div>
        </Link>
        <Divider />
        <div className={styles.postCard__content}>
          <div className={styles.postCard__topRow}>
          <Link
                href={`/post/${post.title.toLowerCase()}/${post.alt_id}`}
                variant="body2"
                color="primary"
                style={mode === 'MINI' ? {} : { fontWeight: 'bold' }}
              >
            <Typography
              variant={mode === 'MINI' ? 'h4' : 'h4'}
              color="textPrimary"
              style={{
                ...(mode === 'MINI' && {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                }),
                paddingBottom: '10px',
              }}
              className={styles.postCard__post_title}
            >
              {post.title}
            </Typography>
            </Link>
            {props.mode !== 'MINI' && props.post.detail ? (
              <Link
                className={styles.postCard__contentDetail}
                href={`/post/${post.alt_id}`}
                variant="body1"
                color="textSecondary"
              >
                {ReactHtmlParser(props.post.detail)}
              </Link>
            ) : null}

             {mode === 'OWNER' ? (
              <>
                <Link href={`/post/edit/${post.alt_id}`}>
                  <Image alt="Message" src={EditIcon} />
                </Link>
                <span onClick={handleDelete} style={{ cursor: 'pointer' }}>
                  <Image alt="Message" src={TrashIcon} />
                </span>
              </>
            ) : (
              <>
                {postUser.public_phone ? (
                  <Link
                    href={`tel:${postUser.public_phone
                      .replace(/ /g, '')
                      .replace(/\-/g, '')}`}
                  >
                    <Image alt="Call" src={PhoneCallIcon} />
                  </Link>
                ) : (
                  <span />
                )}
                
                <div className={styles.postCard__chatmsg}>
                  <TextField
                    id="outlined-basic"
                    label="Please Type your message"
                    variant="outlined"
                    value={newMessage}
                    fullWidth={true}
                    disabled={disabled}
                    onChange={(e) => setNewMessage(e.target.value)}
                    
                    InputProps={{ className: classes.input }}
                  />
                  <div onClick={sendM} className={styles.postCard__chatlink}>
                  {/* ?msg=${newMessage} */}
                    {/* <Link href={`/message/${postUser.id}`}> */}
                      <Image alt="chatIcon" src={chatIcon} />
                    {/* </Link> */}
                  </div>
                </div>
              </>
            )} 
          </div>

          {/* {props.mode !== 'MINI' && props.post.detail ? (
            <Link
              className={styles.postCard__contentDetail}
              href={`/post/${post.alt_id}`}
              variant="body1"
              color="textSecondary"
            >
              {ReactHtmlParser(props.post.detail)}
            </Link>
          ) : null} */}
        </div>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {modalMsg}
          </Typography>
        </Box>
      </Modal>
    </div>
    
  )
}

export default PostCard
