import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function getUserId() {
  let userId = localStorage.getItem('zovex_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('zovex_user_id', userId);
  }
  return userId;
}

export default function RatingStars({ movieId, size = 16, interactive = true, style }) {
  const [hover, setHover] = useState(0);
  const queryClient = useQueryClient();

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings', movieId],
    queryFn: () => base44.entities.Rating.filter({ movie_id: movieId }),
  });

  const rateMutation = useMutation({
    mutationFn: (rating) => {
      const userId = getUserId();
      const existing = ratings.find(r => r.user_identifier === userId);
      
      if (existing) {
        return base44.entities.Rating.update(existing.id, { rating });
      } else {
        return base44.entities.Rating.create({
          movie_id: movieId,
          rating,
          user_identifier: userId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings', movieId] });
    },
  });

  const avgRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
    : 0;
  
  const userRating = ratings.find(r => r.user_identifier === getUserId())?.rating || 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', ...style }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={(hover || userRating) >= star ? '#fbbf24' : (avgRating >= star ? '#fbbf24' : 'none')}
          color={(hover || userRating || avgRating) >= star ? '#fbbf24' : '#6b7280'}
          style={{ cursor: interactive ? 'pointer' : 'default', transition: 'all 0.2s' }}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={(e) => {
            e.stopPropagation();
            if (interactive) rateMutation.mutate(star);
          }}
        />
      ))}
      <span style={{ fontSize: size * 0.875, color: '#9ca3af', marginRight: '4px' }}>
        ({ratings.length})
      </span>
    </div>
  );
}