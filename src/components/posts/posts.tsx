import { Grid, Typography } from '@material-ui/core'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Pagination from '@material-ui/lab/Pagination'
import 'antd/dist/antd.css'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { theme } from '../../styles/theme'
import { useCity } from '../../utils/city/city-context'
import filterJSON from '../../utils/processDuplicates/filterJSON'
import Footer from '../_shared/footer/footer'
import Header from '../_shared/header/header'
import type { PostCardProps } from '../_shared/post-card/post-card'
import PostCard from '../_shared/post-card/post-card'
import PostsFilters from './posts-filters'
import styles from './posts.module.scss'

//@ts-ignore
// import flatten from 'flat'

export type PostsProps = {
  city_alt_id: string
  q: string
  page: number

  result_posts_count: number
  result_posts: PostCardProps['post'][]
  categoryDetails: any
  setFilterText: any
}

const useStyles = makeStyles({
  filtersContainerOnDesktop: {
    [theme.breakpoints.down(721)]: {
      display: 'none',
    },
  },
  filtersContainerOnMobile: {
    display: 'none',

    paddingTop: theme.spacing(2),

    [theme.breakpoints.down(721)]: {
      display: 'initial',
    },
  },
  filtersContainerHiddenOnMobile: {
    display: 'none',
  },
  searchForm: {
    display: 'grid',

    gap: 8,
    gridTemplateColumns: '1fr 0',

    [theme.breakpoints.down(721)]: {
      gridTemplateColumns: '56px 1fr 0',
    },
  },
  filtersButton: {
    display: 'none',

    padding: '4px 0 0',

    // minWidth: 56,
    // width: 56,
    // height: 56,

    [theme.breakpoints.down(721)]: {
      display: 'initial',
    },
  },
  searchField: {
    marginRight: -8,

    height: 56,

    borderRadius: 4,

    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[7],
  },
  searchButton: {
    marginLeft: -56,

    minWidth: 56,
    width: 56,
    height: 56,

    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 0,
  },
  hasClearIcon: {
    marginRight: 50,
  },
  item: {
    paddingLeft: 70,
    paddingBottom: 70,
    '@media (min-width: 1280px) and (max-width: 1476px)': {
      paddingLeft: 40,
      // flexGrow: 0,
      // maxWidth: '100%',
      // flexBasis: '100%',
    },
    '@media (min-width: 320px) and (max-width: 1279px)': {
      paddingLeft: '0',
    },
    '@media (min-width: 1036px) and (max-width: 1279px)': {
      paddingLeft: '0px !important',
    },
  },
  'grid-xs-5': {
    '@media (min-width: 1280px) and (max-width: 1476px)': {
      padding: '10px !important',
    },
    '@media (min-width: 320px) and (max-width: 500px)': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  'grid-md-5': {
    '@media (min-width: 960px) and (max-width: 1035px)': {
      flexGrow: 0,
      maxWidth: '100%',
      flexBasis: '100%',
    },
  },
})

function Posts(props: PostsProps) {
  const router = useRouter()
  const { zipAndCity } = useCity()

  const classes = useStyles()

  const sortNullishValues = (arr: any = []) => {
    const assignValue = (val: any) => {
      if (val === null) {
        return Infinity
      } else {
        return val
      }
    }
    const sorter = (a: any, b: any) => {
      return assignValue(a.promotion_status) - assignValue(b.promotion_status)
    }
    arr.sort(sorter)
  }

  useEffect(() => {
    if (!props.city_alt_id || !zipAndCity) {
      router.push('/')
    } else if (props.city_alt_id !== zipAndCity.city.alt_id) {
      router.push(
        `/posts/${zipAndCity.city.name.toLowerCase()}/${
          zipAndCity.city.alt_id
        }/${encodeURIComponent(props.q.toLowerCase())}/1`
      )
    }
  }, [zipAndCity, props.city_alt_id, props.q, router])

  let [filterText, setFilterText] = useState('')
  let [filteredResults, setFilteredResults] = useState<PostCardProps['post'][]>(
    []
  )

  useEffect(() => {
    setFilterText('')
  }, [props.q])

  useEffect(() => {
    sortNullishValues(props.result_posts)
    if (filterText === '') {
      setFilteredResults(props.result_posts)
    } else {
      setFilteredResults(filterJSON(props.result_posts, filterText))
    }
  }, [props.result_posts, filterText])

  if (!props.city_alt_id || !zipAndCity) {
    return null
  }

  return (
    <>
      <Header {...props} />
      <div className={styles.post__content_wrapper}>
        <Grid container spacing={5}>
          <Grid
            item
            xs={12}
            sm={12}
            md={3}
            lg={2}
            xl={2}
            className={classes['grid-xs-5']}
          >
            <div className={classes.filtersContainerOnDesktop}>
              <PostsFilters {...props} setFilterText={setFilterText} />
            </div>
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={9}
            lg={10}
            xl={10}
            className={clsx(`${classes['grid-xs-5']}`, `${classes['item']}`)}
          >
            <div className={styles.posts__content}>
              <div
                className={`${classes.filtersContainerOnMobile} ${
                  true ? classes.filtersContainerHiddenOnMobile : ''
                }`}
              >
                <PostsFilters {...props} setFilterText={setFilterText} />
              </div>

              {!filteredResults.length ? (
                <Typography color="textSecondary">
                  No posts found.
                  <br />
                  Please adjust the filters and/or your city to see more service
                  posts.
                </Typography>
              ) : (
                <Grid container spacing={0}>
                  {filteredResults.map((post) => (
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={6}
                      lg={6}
                      xl={6}
                      className={clsx(`${classes['grid-md-5']}`, `${classes['item']}`)}
                    >
                      <React.Fragment key={post.id}>
                        <PostCard mode="MINI" post={post} pageName="post-list" />
                      </React.Fragment>
                    </Grid>
                  ))}
                </Grid>
                // <div className={styles.posts__contentPostsGrid}>
                //   {filteredResults.map((post) => (
                //     <React.Fragment key={post.id}>
                //       <PostCard mode="MINI" post={post} />
                //     </React.Fragment>
                //   ))}
                // </div>
              )}

              <div style={{ margin: '0 auto' }}>
                <Pagination
                  count={Math.ceil(props.result_posts_count / 24)}
                  page={props.page}
                  onChange={(_e: any, value: any) => {
                    router.push(
                      `/posts/${zipAndCity.city.name.toLowerCase()}/${
                        zipAndCity.city.alt_id
                      }/${encodeURIComponent(props.q.toLowerCase())}/${value}`
                    )
                  }}
                />
              </div>
            </div>
          </Grid>
        </Grid>
      </div>
      <main className={styles.posts} style={{ display: 'none' }}>
        <div className={classes.filtersContainerOnDesktop}>
          <PostsFilters {...props} setFilterText={setFilterText} />
        </div>

        <div className={styles.posts__content}>
          <div
            className={`${classes.filtersContainerOnMobile} ${
              true ? classes.filtersContainerHiddenOnMobile : ''
            }`}
          >
            <PostsFilters {...props} setFilterText={setFilterText} />
          </div>

          {!filteredResults.length ? (
            <Typography color="textSecondary">
              No posts found.
              <br />
              Please adjust the filters and/or your city to see more service
              posts.
            </Typography>
          ) : (
            <Grid container spacing={10}>
              {filteredResults.map((post) => (
                <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                  <React.Fragment key={post.id}>
                    <PostCard mode="MINI" post={post} pageName="post-list" />
                  </React.Fragment>
                </Grid>
              ))}
            </Grid>
            // <div className={styles.posts__contentPostsGrid}>
            //   {filteredResults.map((post) => (
            //     <React.Fragment key={post.id}>
            //       <PostCard mode="MINI" post={post} />
            //     </React.Fragment>
            //   ))}
            // </div>
          )}

          <div style={{ margin: '0 auto' }}>
            <Pagination
              count={Math.ceil(props.result_posts_count / 24)}
              page={props.page}
              onChange={(_e: any, value: any) => {
                router.push(
                  `/posts/${zipAndCity.city.name.toLowerCase()}/${
                    zipAndCity.city.alt_id
                  }/${encodeURIComponent(props.q.toLowerCase())}/${value}`
                )
              }}
            />
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default Posts
