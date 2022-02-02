import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import Menu from '@material-ui/icons/Menu'
import Place from '@material-ui/icons/Place'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Filter } from 'react-feather'
import LogoAsset from '../../../assets/images/_shared/logo.png'
import useOffSetTop from '../../../hooks/useOffSetTop'
import { useCategories } from '../../../utils/categories/categories-context'
import { useCity } from '../../../utils/city/city-context'
import useDropDown from '../../../utils/use-drop-down/use-drop-down'
import useMobileView from '../../../utils/use-mobile-view/use-mobile-view'
import { useUser } from '../../../utils/user/user-context'
import CategoryCard from '../category-card/category-card'
import Link from '../link/link'
import styles from './header.module.scss'
import navConfig from './MenuConfig'
import MenuMobile from './MenuMobile'
import overlayStyles from './screenoverlay.module.scss'
import Searchbar from './Searchbar'
import LocationIcon from '../../../assets/icons/location.svg'

const HeaderAuthNav = dynamic(() => import('./header-auth-nav'))

function Header(props: any) {
  const isOffset = useOffSetTop(100)
  const router = useRouter()
  const { pathname } = router
  const isHome = pathname === '/'
  const { user, userLoading } = useUser()
  const { categories = [] } = useCategories()

  const { zipAndCity } = useCity(false)

  const [menuRef, isMenuOpen, toggleMenu] = useDropDown()

  const wide = useMobileView({ inverse: true })
  const narrow = useMobileView()

  let [showNav, setShowNav] = useState(false)

  function openNav() {
    // @ts-ignore
    // document?.getElementById('myNav')?.style?.height = '100%'
    setShowNav(true)
  }

  /* Close when someone clicks on the "x" symbol inside the overlay */
  function closeNav() {
    // @ts-ignore
    // document?.getElementById('myNav')?.style?.height = '0%'
    setShowNav(false)
  }

  return (
    <header className={styles.header}>
      <div className={styles.hideMobile}>
        <NextLink
          href={zipAndCity ? `/city/${zipAndCity.city.alt_id}` : '/'}
          passHref
        >
          <Image
            alt="1stKare Logo"
            src={LogoAsset}
            placeholder="blur"
            height={48}
            width={39.03}
            priority
          />
        </NextLink>
      </div>

      <div className={styles.hideDesktop}>
        <MenuMobile
          isOffset={isOffset}
          isHome={isHome}
          navConfig={navConfig}
          categoryMenu={openNav}
        />
      </div>

      <div className={styles.hideMobile}>
        <NextLink href="/?stay=1" passHref>
          <Button
            className={styles.header__location}
            startIcon={<Image src={LocationIcon} alt="LocationIcon" />}
          >
            <Typography
              className={styles.header__locationText}
              variant="body2"
              color={zipAndCity ? 'textPrimary' : 'textSecondary'}
            >
              {zipAndCity
                ? `${zipAndCity.city.name}, ${zipAndCity.city.state_code}`
                : 'Enter you city *'}
            </Typography>
          </Button>
        </NextLink>
      </div>

      <Box style={{ width: '100%', alignItems: 'center', display: 'contents' }}>
        <Searchbar {...props} />
      </Box>

      <span className={wide} />

      <nav className={styles.header__nav}>
        {userLoading ? (
          <></>
        ) : user ? (
          <HeaderAuthNav user={user} openNav={openNav} />
        ) : (
          <>
            <span className={narrow}>
              <Button className={styles.header__avatar} onClick={toggleMenu}>
                <Menu />
              </Button>

              {!isMenuOpen ? null : (
                <div className={styles.header__menu} ref={menuRef}>
                  <NextLink href="/sign-up" passHref>
                    <Button variant="contained" color="primary" size="large">
                      GET STARTED
                    </Button>
                  </NextLink>

                  <Link
                    href="/"
                    onClick={(e) => {
                      e.preventDefault()
                      openNav()
                      toggleMenu()
                    }}
                  >
                    <Filter />
                  </Link>

                  <Link href={zipAndCity ? `/city/${zipAndCity.city.id}` : '/'}>
                    POSTS
                  </Link>

                  <Link href="/?stay=1">CHANGE LOCATION</Link>

                  <Divider />

                  <Link href={`/blog`}>BLOG</Link>

                  <Link href={`/donate`}>DONATE</Link>
                </div>
              )}
            </span>

            <NextLink
              href={zipAndCity ? `/city/${zipAndCity.city.id}` : '/'}
              passHref
            >
              <Button
                variant="text"
                color="primary"
                size="large"
                className={`${wide} ${styles.header__navButtonsDefault}`}
              >
                POSTS
              </Button>
            </NextLink>

            <Button
              variant="text"
              color="primary"
              size="large"
              className={`${wide} ${styles.header__navButtonsDefault}`}
              onClick={openNav}
            >
              <Filter />
            </Button>

            <NextLink href="/sign-up" passHref>
              <Button
                className={wide}
                variant="contained"
                color="primary"
                size="large"
              >
                GET STARTED
              </Button>
            </NextLink>
          </>
        )}
        <div
          id="myNav"
          className={overlayStyles.overlay}
          style={showNav ? { height: '100%' } : { height: '0%' }}
          onClick={closeNav}
        >
          <div className={overlayStyles.overlaycontent}>
            <div className={overlayStyles.categories}>
              <div className={overlayStyles.categories__content}>
                <div
                  className={overlayStyles.categories__contentCategoriesList}
                >
                  {categories?.map((cat: any) => (
                    <CategoryCard key={cat.id} category={cat} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
