import Image from 'next/image'
import { useRouter } from 'next/router'
import React from 'react'

// todo remove in prod
import { useGetUserQuery } from '../../../generated/graphql'
import styles from './message-profile.module.scss'

function ChatProfile(props: { online: Boolean, userID: any }) {
  const router = useRouter()
  const { user_id } = router.query

  const [data] = useGetUserQuery({
    variables: {
      user_id: props.userID,
    },
  })

  console.log(data)


  return (
    <>
      <div className={`${styles['message-profile-container']}`}>
        <div >
          {/* <Image
            src={
              data.data?.users_by_pk?.avatar?.url
                ? data.data?.users_by_pk?.avatar?.url
                : `https://avatars.dicebear.com/api/initials/${encodeURIComponent(
                    data.data?.users_by_pk?.full_name || ''
                  )}.svg`
            }
            height={112}
            width={112}
            alt={`${data.data?.users_by_pk?.full_name}'s Avatar`}
            className={`${styles['profile-pic']}`}
          /> */}
         {
           data.data?.users_by_pk?.business_size === "INDIVIDUAL" ?
           <span style={{
            fontSize: '0.9rem',
            marginBottom: '0.5rem',
            display: 'block',
            textAlign: "left !important",
          }} >
            Full Name: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  {data.data?.users_by_pk?.full_name}
          </span> :

         
          <span style={{fontSize: '0.9rem',
            marginBottom: '0.5rem',
            display: 'block',
            textAlign: "left !important",
            }}>
            Buisness Name: &nbsp; &nbsp; &nbsp; {data.data?.users_by_pk?.business_name}
          </span>
          }


          <div>
            All Posts: 
            {data.data?.users_by_pk?.posts?.map((post) => (
              <div key={post.id}>
                <div style={{fontSize: '0.8rem', marginBottom: '10px'}}>{post.title}</div>
              </div>
            ))}

          </div>

          <span className={`${styles['status']}`}>
            {props.online ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* TODO: handle logic here */}
        {/* <div className={`${styles['request-info']}`}>
          <p>
            [Client name] is asking for contact details. Lets chat and decide
          </p>
          <Button variant="contained" color="primary" size="large">
            Allow client
          </Button>
          <Button variant="outlined" size="large">
            Decline
          </Button>
        </div> */}
      </div>
    </>
  )
}

export default ChatProfile
