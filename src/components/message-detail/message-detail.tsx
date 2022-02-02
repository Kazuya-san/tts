import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import CircularProgress from '@material-ui/core/CircularProgress'

import {
  useGetRoomForUserQuery,
  useUserOnlineSubscription,
} from '../../generated/graphql'
import { gql } from 'graphql-request'
import { hasuraServerRequest } from '../../../src/utils/hasura/hasura-server-request'
import { useUser } from '../../utils/user/user-context'
import ChatMain from '../chat/chat-convo/chat-convo'
import ChatSideBar from '../chat/chat-sidebar/chat-sidebar'
import ChatProfile from '../chat/message-profile/message-profile'
import ChatHeader from '../chat/message-header/message-header'
import styles from './message-detail.module.scss'

dayjs.extend(utc)
const MessageDetail = () => {
  const router = useRouter()
  const [userID, setUserID] = useState(null);

  const { user_id } = router.query
  const nmsg = router.query.msg ? router.query.msg : "";
  const { user } = useUser(true)

  const [isRoomPresent, setIsRoomPresent] = useState(false)
  const [roomId, setRoomId] = useState<number>()
  const [msg, setmsg] = useState<any>(nmsg)

  const [userIsOnline, setUserIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState<any>()

  const handleSubscription = (oldData: any, response: any) => {
    setLastSeen(dayjs.utc(response.users_by_pk?.last_seen))
  }
  useUserOnlineSubscription(
    {
      variables: {
        id: user_id,
      },
    },
    handleSubscription
  )
  useEffect(() => {
    const interval = setInterval(() => {
      // check if the value of last_seen is less than 10 sec
      if (!lastSeen) return
      if (dayjs.utc().diff(dayjs.utc(lastSeen), 'seconds') <= 10) {
        setUserIsOnline(true)
      } else {
        setUserIsOnline(false)
      }
    }, 1 * 6000 * 60)
    return () => {
      clearInterval(interval)
    }
  }, [lastSeen])

  const [room, refetchRoomForUser] = useGetRoomForUserQuery({
    variables: {
      user_id: userID,
      my_id: user?.id,
    },
  })

  
  

  useEffect(() => {
    const cal = async() => {
      const { users } = await hasuraServerRequest<
      {
        users: SellerDetailProps['user'][]
      },
      { seller_id: string }
    >(
      gql`
      query SellerDetail_StaticProps($seller_id: bpchar!) {
        users: users(where: { alt_id: { _eq: $seller_id } }) {
          id
          email
          public_contact_address
          public_phone
          avatar {
            url
          }
          full_name
          business_name
          zip_code {
            city {
              name
              state_code
            }
          }
        }
        post_prices(where: { post: { user: { alt_id: { _eq: $seller_id } } } }) {
          id
          price
        }
        posts(where: { user: { alt_id: { _eq: $seller_id } } }) {
          id
          alt_id
          title
          detail
          promotion_status
          user {
            id
            email
            public_phone
            avatar {
              url
            }
            full_name
            business_name
          }
          post_prices {
            id
            price
          }
          post_attribute {
            possible_value
          }
      
          sub_category {
            id
            name
            category {
              id
              name
            }
          }
        }
      }    
       
      `,
      { seller_id: user_id }
    )
  
    setUserID(users?.[0]?.id);
    console.log(user_id)
      }
     user_id && cal()
      refetchRoomForUser()
  }, [refetchRoomForUser])

  useEffect(() => {
    //console.log(user_id)
    //console.log(room);
    if (!room.fetching && room.data?.rooms[0]?.id) {
      setRoomId(room.data?.rooms[0]?.id)
      setIsRoomPresent(true)
    }
  }, [room])

  //console.log({ roomId, isRoomPresent })
  //console.log(process)

  return (
    <div>
      {/* TODO: set padding to 36px for large screen */}
      <div className={`${styles['message-detail-container']}`}>
        <div>
        {userID && <ChatHeader userID={userID} online={userIsOnline} />}
        </div>

        <div className={`${styles['message-detail']}`}>
          <div>
            <ChatSideBar />
          </div>

          {room.fetching ? (
            <div className={`${styles['loading-container']}`}>
              <CircularProgress style={{ margin: 'auto' }} />
            </div>
          ) : (
            <ChatMain
              roomId={roomId!}
              setRoomId={setRoomId}
              isRoomPresent={isRoomPresent}
              setIsRoomPresent={setIsRoomPresent}
              msg={msg}
            />
          )}

          <div className={`${styles['chat-profile-container']}`}>
           {userID && <ChatProfile userID={userID} online={userIsOnline} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageDetail
