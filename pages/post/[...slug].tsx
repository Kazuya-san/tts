import { gql } from 'graphql-request'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { NextSeo } from 'next-seo'
import type { PostDetailProps } from '../../src/components/post-detail/post-detail'
import PostDetail from '../../src/components/post-detail/post-detail'
import { hasuraServerRequest } from '../../src/utils/hasura/hasura-server-request'

function PostDetailPage(props: PostDetailProps) {
  return (
    <>
      <NextSeo title={props.post.title} description={props.post.detail} />
      <PostDetail {...props} />
    </>
  )
}

export default PostDetailPage

type PostDetailParams = { slug: string[] }

export const getStaticPaths: GetStaticPaths<PostDetailParams> = async () => {
  return { paths: [], fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps<PostDetailProps, PostDetailParams> =
  async ({ params }) => {
    const [, alt_id] = params?.slug || []

    if (!alt_id) {
      return { notFound: true }
    }

    const { post } = await hasuraServerRequest<
      { post: PostDetailProps['post'][] },
      { alt_id: string }
    >(
      gql`
        query PostDetail_StaticProps($alt_id: bpchar!) {
          post: posts(where: { alt_id: { _eq: $alt_id } }) {
            id
            alt_id
            promotion_status
            posted_by
            title
            years_of_experience
            detail
            user {
              id
              alt_id
              zip_code {
                city {
                  id
                  name
                  state_code
                }
              }
              email
              public_contact_address
              public_phone
              last_seen
              avatar {
                url
              }
              full_name
              business_name
            }
            post_attachments {
              id
              file {
                url
                name
                type
              }
            }
            post_prices {
              id
              price
              detail
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
                sub_categories {
                  id
                  name
                }
              }
            }
          }
        }
      `,
      { alt_id }
    )

    if (!post.length) {
      return { notFound: true }
    }

    return {
      props: {
        post: post[0],
      },
      revalidate: 60 * 60,
    }
  }
