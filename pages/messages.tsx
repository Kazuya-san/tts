import {
  useGetRoomsListQuery,
} from '../src/generated/graphql'
import { useUser } from '../src/utils/user/user-context'
import {useRouter} from "next/router"
import Footer from '../src/components/_shared/footer/footer'
import Header from '../src/components/_shared/header/header'
import MessageDetailWithNoRoom from '../src/components/message-detail/message-detail-with-no-room'
import { useEffect } from 'react'

function Chat() {
  const { user } = useUser(true)  
  const router = useRouter()
  const [data] = useGetRoomsListQuery({
    variables: {
      user_id: user?.id,
    },
  })

  if (!data.error && !data.fetching) {
    if(data.data?.rooms.length > 0) router.push(`/message/${data.data?.rooms[0].user_rooms[0].user.alt_id}`)
  }

  //console.log(data)
  return (
    <>
      <Header />
      <MessageDetailWithNoRoom />
      <Footer />
    </>
  )
}

export default Chat
