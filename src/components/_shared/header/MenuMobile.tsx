import MenuIcon from '@material-ui/icons/Menu'
import { useState, useEffect } from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'
// import { NavLink as RouterLink, useLocation } from 'next/link';
// material
import { alpha } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { List, Drawer, ListItem, ListItemText } from '@material-ui/core'
// components
import { useCity } from '../../../utils/city/city-context'
import Scrollbar from '../../_shared/Scrollbar'
import { MIconButton } from '../../@material-extend'
import LogoAsset from '../../../assets/images/_shared/logo.png'

// ----------------------------------------------------------------------

function MenuMobileItem({ item, isOpen, onOpen, categoryMenu }: any) {
  const { title, path } = item

  return (
    <NextLink href={path} passHref>
      <ListItem
        onClick={(e) => {
          if (title === 'CATEGORIES') {
            e.preventDefault()
            categoryMenu()
          }
        }}
        style={{
          // @ts-ignore
          '&.active': {
            color: 'primary.main',
            fontWeight: 'fontWeightMedium',
            bgcolor: (theme: any) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.action.selectedOpacity
              ),
          },
        }}
      >
        <ListItemText disableTypography primary={title} />
      </ListItem>
    </NextLink>
  )
}

export default function MenuMobile({
  isOffset,
  isHome,
  navConfig,
  categoryMenu,
}: any) {
  const router = useRouter()
  const { zipAndCity } = useCity(false)
  const [open, setOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (drawerOpen) {
      handleDrawerClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.pathname])

  const handleOpen = () => {
    setOpen(!open)
  }

  const handleDrawerOpen = () => {
    setDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
  }

  return (
    <>
      <MIconButton
        onClick={handleDrawerOpen}
        // @ts-ignore
        sx={{
          ml: 1,
          ...(isHome && { color: 'common.white' }),
          ...(isOffset && { color: 'text.primary' }),
        }}
      >
        <MenuIcon />
      </MIconButton>

      <Drawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ style: { paddingBottom: 5, width: 260 } }}
      >
        <Scrollbar>
          <NextLink
            href={zipAndCity ? `/city/${zipAndCity.city.id}` : '/'}
            passHref
          >
            <Button>
              <Image
                alt="1stKare Logo"
                src={LogoAsset}
                placeholder="blur"
                layout="fixed"
                height={64}
                width={52.04}
                sizes="52.04px"
                priority
              />
            </Button>
          </NextLink>

          <List disablePadding>
            {navConfig.map((link: any) => (
              <MenuMobileItem
                key={link.title}
                item={link}
                isOpen={open}
                onOpen={handleOpen}
                categoryMenu={categoryMenu}
              />
            ))}
          </List>
        </Scrollbar>
      </Drawer>
    </>
  )
}
