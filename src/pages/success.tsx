import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Stripe from 'stripe'
import { stripe } from '../lib/stripe'
import {
  ImageContainer,
  ImagesContainer,
  SuccessContainer,
} from '../styles/pages/sucess'

interface SuccessProps {
  customerName: string
  productsImages: string[]
}

export default function Success({
  customerName,
  productsImages,
}: SuccessProps) {
  return (
    <>
      <Head>
        <title>Compra Efetuada | Navi Shop</title>

        <meta name="robots" content="noindex" />
      </Head>

      <SuccessContainer>
        <ImagesContainer>
          {productsImages.map((image, index) => {
            return (
              <ImageContainer key={index}>
                <Image src={image} width={120} height={110} alt="" />
              </ImageContainer>
            )
          })}
        </ImagesContainer>

        <h1>Compra efetuada!</h1>

        <p>
          Uhuul <strong>{customerName}</strong>, sua compra de{' '}
          <strong>{productsImages.length} camisetas</strong> já esta a caminho
          da sua casa
        </p>

        <Link href="/">Voltar ao catálogo</Link>
      </SuccessContainer>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const sessionId = query.session_id as string

  if (!sessionId) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'line_items.data.price.product'],
  })

  const customerName = session.customer_details?.name
  const productsImages = session.line_items?.data.map((item) => {
    const product = item.price?.product as Stripe.Product
    return product.images[0]
  })

  return {
    props: {
      customerName,
      productsImages,
    },
  }
}
