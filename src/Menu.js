import { useState } from 'react';
import { 
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Menu as MenuIcon } from 'lucide-react';

const Menu = ({ items }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuList = (
    <List>
      {items.map((item) => (
        <ListItem 
          key={item.label} 
          component="a" 
          href={item.url}
          target="_blank"
          rel="noreferrer"
          onClick={toggleDrawer(false)}
          sx={{
            padding: '12px 24px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <ListItemText 
            primary={item.label}
            sx={{
              color: '#fff',
              '& .MuiTypography-root': {
                fontSize: isMobile ? '14px' : '16px',
              }
            }}
          />
        </ListItem>
      ))}
    </List>
  );

  if (isMobile) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleDrawer(true)}
          sx={{ color: '#fff' }}
        >
          <MenuIcon size={24} />
        </IconButton>
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: '250px',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(10px)',
            }
          }}
        >
          {menuList}
        </Drawer>
      </Box>
    );
  }

  // Desktop menu
  return (
    <nav style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '16px',
      padding: '20px',
      flexWrap: 'wrap',
      justifyContent: 'center',
      background: 'rgba(40, 40, 40, 0)',
      backdropFilter: 'blur(5px)',
      borderRadius: '8px',
      margin: '0 20px'
    }}>
      {items.map(item => (
        <a
          key={item.label}
          href={item.url}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '12px',
            fontSize: '24px',
            color: '#fff',
            textDecoration: 'none',
            transition: 'color 0.3s ease',
            '&:hover': {
              color: '#ccc'
            }
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
};

export default Menu;