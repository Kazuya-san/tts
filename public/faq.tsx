import { gql } from 'graphql-request'
import type { GetStaticProps } from 'next'
import { NextSeo } from 'next-seo'
import type { FaqProps } from '../src/components/faq/faq'
import Faq from '../src/components/faq/faq'
import { strapiServerRequest } from '../src/utils/strapi/strapi-server-request'

type FaqPageProps = FaqProps

function FaqPage(props: FaqPageProps) {
  return (
    <>
      <NextSeo title="Frequently Asked Questions" />

      <Faq {...props} />
    </>
  )
}

export default FaqPage

export const getStaticProps: GetStaticProps<FaqPageProps> = async () => {
  const { faqs } = await strapiServerRequest<{ faqs: FaqPageProps['faqs'] }>(
    gql`
      query Faq_StaticProps {
        faqs {
          question
          answer
        }
      }
    `
  )

  return {
    props: {
      faqs,
    },
    revalidate: 60 * 60,
  }
}
