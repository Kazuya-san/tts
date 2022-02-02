import { gql } from 'graphql-request'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { NextSeo } from 'next-seo'
import type { PostsProps } from '../../src/components/posts/posts'
import Posts from '../../src/components/posts/posts'
import { hasuraServerRequest } from '../../src/utils/hasura/hasura-server-request'
import processDuplicates from '../../src/utils/processDuplicates/processDuplicates'

function PostsPage(props: PostsProps) {
  return (
    <>
      <NextSeo
        title="Search service posts"
        description={`Discover for service posts by skilled professionals in categories${
          props.q ? ` matching the term "${props.q}"` : ''
        }.`}
      />

      <Posts {...props} />
    </>
  )
}

export default PostsPage

type PostsParams = {
  slugs: string[]
}

export const getStaticPaths: GetStaticPaths<PostsParams> = async () => {
  return { paths: [], fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps<PostsProps, PostsParams> = async ({
  params,
}) => {
  const [_city_name, city_alt_id, category, page] = params?.slugs ?? []
  const pageCount = Number(page)

  if (!city_alt_id) {
    return { notFound: true }
  }

  const { result_posts } = await hasuraServerRequest<
    {
      result_posts: PostsProps['result_posts']
    },
    {
      q_ilike?: string
      city_alt_id?: string
      offset?: number
    }
  >(
    gql`
      query Search_Posts(
        $city_alt_id: bpchar! = ""
        $q_ilike: String! = ""
        $offset: Int = 0
      ) {
        result_posts: search_all_posts_and_post_attributes20(
          offset: $offset
          limit: 24
          args: { search_text: $q_ilike }
          distinct_on: post_id
          where: {
            user: { zip_code: { city: { alt_id: { _eq: $city_alt_id } } } }
          }
          order_by: { post_id: asc }
        ) {
          category_name
          sub_category_name
          post_id
          alt_id
          category_id
          sub_category_id
          tags
          detail
          promotion_status
          title
          user {
            id
            alt_id
            email
            full_name
            business_name
            business_size
            zip_code {
              city {
                id
                name
                state_code
              }
            }
            avatar {
              url
              post_attachments {
                id
                file {
                  url
                  name
                  type
                }
              }
            }
          }
          post_prices {
            id
            price
            detail
          }
        }
      }
    `,
    {
      city_alt_id,
      q_ilike: category,
      offset: 24 * (pageCount - 1),
    }
  )

  // console.log(result_posts)
  let categoryDetails = processDuplicates(result_posts)

  return {
    props: {
      city_alt_id,
      q: category,
      page: pageCount,

      result_posts_count: result_posts.length,
      result_posts,
      categoryDetails,
      setFilterText: null,
    },
    revalidate: 60 * 60,
  }
}
