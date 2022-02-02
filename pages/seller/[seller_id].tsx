import { gql } from 'graphql-request'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { NextSeo } from 'next-seo'
import type { SellerDetailProps } from '../../src/components/seller-detail/seller-detail'
import SellerDetail from '../../src/components/seller-detail/seller-detail'
import { hasuraServerRequest } from '../../src/utils/hasura/hasura-server-request'

function SellerDetailPage(props: SellerDetailProps) {

  return (
    <>
      <NextSeo title={`${props.user.full_name} — Seller`} />

      <SellerDetail {...props} />
    </>
  )
}

export default SellerDetailPage

type SellerDetailParams = { seller_id: string }

export const getStaticPaths: GetStaticPaths<SellerDetailParams> = async () => {
  return { paths: [], fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps<
  SellerDetailProps,
  SellerDetailParams
> = async ({ params }) => {
  if (!params?.seller_id) {
    return { notFound: true }
  }
  const seller_id = params.seller_id

  const { users, post_prices, posts } = await hasuraServerRequest<
    {
      users: SellerDetailProps['user'][]
      post_prices: SellerDetailProps['prices']
      posts: SellerDetailProps['posts']
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
    { seller_id }
  )

  const user = users?.[0]
  if (!user) {
    return { notFound: true }
  }

  return {
    props: {
      user,
      prices: post_prices,
      posts,
    },
    revalidate: 60 * 60,
  }
}
