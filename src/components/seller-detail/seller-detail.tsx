import { Container, Grid, Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import NextLink from 'next/link'
import AddIcon from '@material-ui/icons/Add'
import { useMemo } from 'react'
import { useUser } from '../../utils/user/user-context'
import Footer from '../_shared/footer/footer'
import Header from '../_shared/header/header'
import type { PostCardProps } from '../_shared/post-card/post-card'
import PostCard from '../_shared/post-card/post-card'
import type { SellerCardProps } from '../_shared/seller-card/seller-card'
import SellerCard from '../_shared/seller-card/seller-card'
import styles from './seller-detail.module.scss'

export type SellerDetailProps = {
  user: SellerCardProps['user']
  prices: SellerCardProps['prices']
  posts: PostCardProps['post'][]
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
}))

function SellerDetail({ user, prices, posts }: SellerDetailProps) {
  const classes = useStyles()
  const { user: me } = useUser()
  const limitReached = useMemo(() => !!(posts?.length >= 3), [posts])
  return (
    <>
      <Header />
      <Container>
        <div className={classes.root}>
          <Grid
            container
            spacing={0}
            justifyContent="center"
            alignItems="center"
          >
            <Grid item xs={12}>
              <SellerCard user={user} prices={prices} />
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              md={8}
              lg={8}
              xl={8}
              className={styles.sellerDetail__sellerPosts_List_wrapper}
            >
              <div className={styles.sellerDetail__postby_with_newpost}>
                <Typography
                  variant="h3"
                  component="h1"
                  className={styles.sellerDetail__sellerPosts_List_title}
                >
                  POSTS BY{' '}
                  {(
                    user.full_name.split(' ')[0] || 'THIS SELLER'
                  ).toUpperCase()}
                </Typography>
                {me?.id === user.id && !limitReached ? (
                  <NextLink href="/post/new" passHref>
                    <Button
                      startIcon={<AddIcon className={styles.sellerDetail__newPostIcon} />}
                      variant="contained"
                      size="large"
                      color="primary"
                      className={styles.sellerDetail__newPostBtn}
                    >
                      New Post
                    </Button>
                  </NextLink>
                ) : null}
              </div>
              {!posts.length ? (
                <Typography color="textSecondary">
                  {me?.id === user.id ? 'You' : 'This seller'} have no posts
                  yet.
                </Typography>
              ) : (
                posts.map((post) => (
                  <div className={styles.sellerDetail__postCard}>
                    <PostCard
                      key={post.id}
                      mode={me?.id === user.id ? 'OWNER' : 'LARGE'}
                      post={post}
                      pageName={me?.id === user.id && !limitReached ? 'seller-post' : 'seller-detail'}
                    />
                  </div>
                ))
              )}
            </Grid>
          </Grid>
        </div>
      </Container>
      {/* <main className={styles.sellerDetail}>
        <div className={styles.sellerDetail__content}>
          <div className={styles.sellerDetail__contentTopRow}>
            <Typography variant="h3" component="h1">
              POSTS BY{' '}
              {(user.full_name.split(' ')[0] || 'THIS SELLER').toUpperCase()}
            </Typography>

            {me?.id === user.id && !limitReached ? (
              <NextLink href="/post/new" passHref>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  size="large"
                  color="primary"
                >
                  New Post
                </Button>
              </NextLink>
            ) : null}
          </div>

          {!posts.length ? (
            <Typography color="textSecondary">
              {me?.id === user.id ? 'You' : 'This seller'} have no posts yet.
            </Typography>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                mode={me?.id === user.id ? 'OWNER' : 'LARGE'}
                post={post}
              />
            ))
          )}
        </div>
      </main> */}

      <Footer />
    </>
  )
}

export default SellerDetail
