import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

/**
 * Shared presentation for a booking-status result.
 *
 * @param {object} props
 * @param {React.ReactNode} props.icon       Status icon element.
 * @param {string} props.color               Theme palette key ('primary' | 'secondary' | ...).
 * @param {string} props.statusLabel         Short chip label (e.g. "Pending approval").
 * @param {string} props.title               Headline.
 * @param {string} props.description         Body copy.
 * @param {React.ReactNode} [props.children] Optional footer / actions.
 */
export default function StatusCard({
  icon,
  color = 'primary',
  statusLabel,
  title,
  description,
  children,
}) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      {/* accent strip */}
      <Box sx={{ height: 4, bgcolor: `${color}.main` }} />

      <Box sx={{ p: { xs: 3, sm: 3.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}.light`,
              color: `${color}.dark`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Chip
              label={statusLabel}
              size="small"
              sx={{
                bgcolor: `${color}.light`,
                color: `${color}.dark`,
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                mb: 0.5,
              }}
            />
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              {title}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', lineHeight: 1.65 }}
        >
          {description}
        </Typography>

        {children && (
          <>
            <Divider sx={{ my: 2.5 }} />
            {children}
          </>
        )}
      </Box>
    </Box>
  );
}
