import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AppBar, Box, Toolbar, Typography, IconButton, MenuItem, Menu, MenuList, Tooltip, Avatar, ListItemIcon, ListItemText} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import SchoolIcon from '@mui/icons-material/School';
import type { INavBarProps } from '../../Interfaces/INavBarProps'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const NavBar: React.FC<INavBarProps>  = ({ username, onLogout, teacher }) => {
    // profile
    const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(null)

    const handleOpenProfile = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElProfile(event.currentTarget)
    }

    const handleCloseProfile = () => {
        setAnchorElProfile(null)
    }

    // menu
    const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null)

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElMenu(event.currentTarget)
    }

    const handleCloseMenu = () => {
        setAnchorElMenu(null)
    }

    // navigation
    const navigate = useNavigate()
    const location = useLocation()

    const handleNavToSubjectSelection = () => {
        handleCloseMenu()
        navigate("/")
    }

    const handleNavToAdministration = () => {
        handleCloseMenu()
        navigate("/administration")
    }

    return (
        <Box sx={{ flexGrow: 1, p: 2 }}>
            <AppBar position="sticky" sx={{
                    borderRadius: 4,
                    mx: "auto", 
                    width: "calc(100% - 32px)"
                }}>
                <Toolbar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 700, letterSpacing: '.3rem' }} component={Link} to="/">
                            AI Buddy
                        </Typography>
                    </Box>
                    <div>
                        <Tooltip title={username} arrow>
                            <IconButton
                                size="large"
                                aria-label="profile"
                                onClick={handleOpenProfile}
                                color="inherit"
                            >
                                <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}>{username.charAt(0).toUpperCase()}</Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={anchorElProfile}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElProfile)}
                            onClose={handleCloseProfile}
                            slotProps={{
                                paper: {
                                    sx: { borderRadius: 4 }
                                }
                            }}
                        >
                        <MenuList sx={{py: 0}}>
                            <MenuItem onClick={handleCloseMenu}><ListItemIcon><AccountCircleIcon sx={{ mr: 2 }}/></ListItemIcon><ListItemText sx={{ mr: 1 }}>Profil</ListItemText></MenuItem>
                            <MenuItem onClick={onLogout}><ListItemIcon><LogoutIcon sx={{ mr: 2 }}/></ListItemIcon><ListItemText sx={{ mr: 1 }}>Abmelden</ListItemText></MenuItem>
                        </MenuList>
                        </Menu>
                    </div>
                    <div>
                        <Tooltip title="Menü" arrow>
                            <IconButton
                                size="large"
                                aria-label="menu"
                                onClick={handleOpenMenu}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={anchorElMenu}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElMenu)}
                            onClose={handleCloseMenu}
                            slotProps={{
                                paper: {
                                    sx: { borderRadius: 4 }
                                }
                            }}
                        >
                            <MenuList sx={{py: 0}}>
                                {
                                    location.pathname != "/" &&
                                    <MenuItem onClick={handleNavToSubjectSelection}><ListItemIcon><SchoolIcon sx={{ mr: 2 }}/></ListItemIcon><ListItemText sx={{ mr: 1 }}>Fachauswahl</ListItemText></MenuItem>
                                }
                                {
                                    teacher && location.pathname != "/administration" &&
                                    <MenuItem onClick={handleNavToAdministration}><ListItemIcon><AdminPanelSettingsIcon sx={{ mr: 2 }}/></ListItemIcon><ListItemText sx={{ mr: 1 }}>Verwaltung</ListItemText></MenuItem>
                                }
                                <MenuItem onClick={handleCloseMenu}><ListItemIcon><SettingsIcon sx={{ mr: 2 }}/></ListItemIcon><ListItemText sx={{ mr: 1 }}>Einstellungen</ListItemText></MenuItem>
                            </MenuList>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default NavBar