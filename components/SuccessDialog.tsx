import { Dialog, DialogTitle, DialogContent, Button } from '@mui/material';

const SuccessDialog = ({ open, onClose, message }: { open: boolean; onClose: () => void; message: string }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '16px', // Rounded corners for the dialog box
          backgroundColor: '#f5f5f5', // Light background
          padding: '20px', // Inner padding
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)', // Soft shadow for the dialog
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: '600',
          fontSize: '1.5rem',
          color: '#3f51b5', // Deep blue color for title
          textAlign: 'center', // Centering the title
          marginBottom: '16px', // Space between title and content
        }}
      >
        Success
      </DialogTitle>
      <DialogContent
        sx={{
          fontSize: '1rem',
          color: '#333', // Dark text color for better readability
          textAlign: 'center', // Centering the message
        }}
      >
        <p>{message}</p>
        <Button
          onClick={onClose}
          color="primary"
          variant="contained"
          sx={{
            marginTop: '20px',
            width: '100%', // Full width button
            padding: '10px 0', // Taller button
            borderRadius: '8px', // Rounded corners on button
            backgroundColor: '#4caf50', // Green background color for success
            '&:hover': {
              backgroundColor: '#388e3c', // Darker green on hover
            },
          }}
        >
          OK
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;
