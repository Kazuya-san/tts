import { gql } from 'graphql-request'
import type { GetStaticProps } from 'next'
import { NextSeo } from 'next-seo'
import type { TermsProps } from '../src/components/terms/terms'
import Terms from '../src/components/terms/terms'
import { strapiServerRequest } from '../src/utils/strapi/strapi-server-request'

type TermsPageProps = TermsProps

function TermsPage(props: TermsPageProps) {
  return (
    <>
      <NextSeo title="Terms" />

      <Terms {...props} />
    </>
  )
}

export default TermsPage

export const getStaticProps: GetStaticProps<TermsPageProps> = async () => {
  const {
    legal: {
      terms: { content },
    },
  } = await strapiServerRequest<{
    legal: { terms: { content: TermsPageProps['content'] } }
  }>(
    gql`
      query Terms_StaticProps {
        legal {
          terms {
            content
          }
        }
      }
    `
  )

  return {
    props: {
      content,
    },
    revalidate: 60 * 60,
  }
}
