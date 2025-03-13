import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Paper,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Reply as ReplyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import EmptyState from './EmptyState';

const Comment = ({ comment, replies = [], onAddReply }) => {
  const { currentUser } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [liked, setLiked] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  
  const handleToggleLike = () => {
    setLiked(!liked);
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      onAddReply(comment.id, replyText);
      setReplyText('');
      setShowReplyForm(false);
      setShowReplies(true);
    }
  };

  const formattedDate = format(new Date(comment.fecha_creacion), 'dd MMM yyyy, HH:mm', { locale: es });

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Avatar 
          src={comment.usuario_avatar} 
          alt={comment.usuario_nombre} 
        />
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {comment.usuario_nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formattedDate}
            </Typography>
          </Box>
          <Typography variant="body2" paragraph sx={{ mt: 0.5 }}>
            {comment.contenido}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              size="small" 
              onClick={handleToggleLike}
              color={liked ? "primary" : "default"}
            >
              {liked ? <ThumbUpIcon fontSize="small" /> : <ThumbUpOutlinedIcon fontSize="small" />}
            </IconButton>
            <Button
              size="small"
              startIcon={<ReplyIcon />}
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              Responder
            </Button>
            
            {replies.length > 0 && (
              <Button
                size="small"
                endIcon={showReplies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowReplies(!showReplies)}
              >
                {replies.length} {replies.length === 1 ? 'respuesta' : 'respuestas'}
              </Button>
            )}
          </Box>
          
          <Collapse in={showReplyForm}>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Avatar 
                src={currentUser?.avatar} 
                alt={currentUser?.nombre}
                sx={{ width: 32, height: 32 }}
              />
              <Box component="form" onSubmit={handleReplySubmit} sx={{ flexGrow: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Escribe una respuesta..."
                  size="small"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button 
                    size="small" 
                    onClick={() => setShowReplyForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small"
                    type="submit"
                    disabled={!replyText.trim()}
                  >
                    Responder
                  </Button>
                </Box>
              </Box>
            </Box>
          </Collapse>
          
          {/* Respuestas al comentario */}
          {replies.length > 0 && (
            <Collapse in={showReplies}>
              <Box sx={{ pl: 4, mt: 2 }}>
                {replies.map((reply) => (
                  <Box key={reply.id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Avatar 
                      src={reply.usuario_avatar} 
                      alt={reply.usuario_nombre}
                      sx={{ width: 28, height: 28 }}
                    />
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {reply.usuario_nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(reply.fecha_creacion), 'dd MMM yyyy, HH:mm', { locale: es })}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {reply.contenido}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Collapse>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const CommentSection = ({ comments, onAddComment, onAddReply }) => {
  const { currentUser } = useAuth();
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(commentText);
      setCommentText('');
    }
  };

  // Agrupar comentarios y respuestas
  const commentsMap = {};
  comments.forEach(comment => {
    if (!comment.comentario_padre_id) {
      if (!commentsMap[comment.id]) {
        commentsMap[comment.id] = { comment, replies: [] };
      } else {
        commentsMap[comment.id].comment = comment;
      }
    } else {
      if (!commentsMap[comment.comentario_padre_id]) {
        commentsMap[comment.comentario_padre_id] = { replies: [comment] };
      } else {
        commentsMap[comment.comentario_padre_id].replies.push(comment);
      }
    }
  });

  const rootComments = Object.values(commentsMap)
    .filter(item => item.comment)
    .sort((a, b) => new Date(b.comment.fecha_creacion) - new Date(a.comment.fecha_creacion));

  const handleReply = (parentId, replyText) => {
    const newReply = {
      id: `com-${Date.now()}`,
      entidad: comments[0]?.entidad || 'unknown',
      entidad_id: comments[0]?.entidad_id || 'unknown',
      contenido: replyText,
      fecha_creacion: new Date().toISOString(),
      usuario_id: currentUser.id,
      usuario_nombre: currentUser.nombre,
      usuario_avatar: currentUser.avatar,
      comentario_padre_id: parentId
    };
    
    // En una implementación real, aquí se enviaría la respuesta a la API
    if (commentsMap[parentId]) {
      commentsMap[parentId].replies.push(newReply);
      onAddReply?.(parentId, newReply);
    }
  };

  return (
    <Box>
      {/* Formulario para añadir comentario */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 4, 
          borderRadius: 2,
          backgroundColor: 'rgba(0,0,0,0.02)' 
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Avatar 
              src={currentUser?.avatar} 
              alt={currentUser?.nombre} 
            />
            <Box sx={{ flexGrow: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Escribe un comentario..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  type="submit"
                  disabled={!commentText.trim()}
                >
                  Comentar
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Lista de comentarios */}
      {rootComments.length > 0 ? (
        <Box>
          {rootComments.map(({ comment, replies }) => (
            <React.Fragment key={comment.id}>
              <Comment 
                comment={comment} 
                replies={replies} 
                onAddReply={handleReply} 
              />
              {comment.id !== rootComments[rootComments.length - 1].comment.id && <Divider sx={{ my: 3 }} />}
            </React.Fragment>
          ))}
        </Box>
      ) : (
        <Box sx={{ my: 4 }}>
          <EmptyState 
            message="Sé el primero en comentar" 
            paperProps={{ 
              sx: { 
                p: 3, 
                textAlign: 'center',
                borderRadius: 2, 
                backgroundColor: 'rgba(0,0,0,0.02)' 
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default CommentSection;
