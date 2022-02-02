import { gql } from 'graphql-request'
import type { GetStaticProps } from 'next'
import { NextSeo } from 'next-seo'
import type { PrivacyProps } from '../src/components/privacy/privacy'
import Privacy from '../src/components/privacy/privacy'
import { strapiServerRequest } from '../src/utils/strapi/strapi-server-request'

type PrivacyPageProps = PrivacyProps

function PrivacyPage(props: PrivacyPageProps) {
  return (
    <>
      <NextSeo title="Privacy" />

      <Privacy {...props} />
    </>
  )
}

export default PrivacyPage

export const getStaticProps: GetStaticProps<PrivacyPageProps> = async () => {
  const {
    legal: {
      privacy: { content },
    },
  } = await strapiServerRequest<{
    legal: { privacy: { content: PrivacyPageProps['content'] } }
  }>(
    gql`
      query Privacy_StaticProps {
        legal {
          privacy {
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
