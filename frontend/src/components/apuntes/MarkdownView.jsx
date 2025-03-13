import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, Typography, Link, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const MarkdownContainer = styled(Box)(({ theme }) => ({
  '& h1': {
    ...theme.typography.h4,
    fontWeight: 600,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  '& h2': {
    ...theme.typography.h5,
    fontWeight: 600,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  '& h3': {
    ...theme.typography.h6,
    fontWeight: 600,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
  },
  '& p': {
    ...theme.typography.body1,
    marginBottom: theme.spacing(2),
    lineHeight: 1.7,
  },
  '& ul, & ol': {
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
  },
  '& li': {
    ...theme.typography.body1,
    marginBottom: theme.spacing(1),
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.grey[300]}`,
    margin: theme.spacing(2, 0),
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.grey[50],
    fontStyle: 'italic',
  },
  '& img': {
    maxWidth: '100%',
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  '& code': {
    fontFamily: 'monospace',
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(0.5, 1),
    borderRadius: 4,
  },
  '& pre': {
    fontFamily: 'monospace',
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.common.white,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflowX: 'auto',
    marginBottom: theme.spacing(2),
    '& code': {
      backgroundColor: 'transparent',
      color: 'inherit',
      padding: 0,
    },
  },
  '& table': {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: theme.spacing(2),
    '& th, & td': {
      border: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(1, 2),
    },
    '& th': {
      backgroundColor: theme.palette.grey[100],
      fontWeight: theme.typography.fontWeightMedium,
    },
    '& tr:nth-of-type(even)': {
      backgroundColor: theme.palette.grey[50],
    },
  },
}));

const MarkdownView = ({ content }) => {
  if (!content) {
    return (
      <Paper elevation={0} sx={{ p: 4, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No hay contenido para mostrar
        </Typography>
      </Paper>
    );
  }

  return (
    <MarkdownContainer>
      <ReactMarkdown>{content}</ReactMarkdown>
    </MarkdownContainer>
  );
};

export default MarkdownView;
