import { useQuery, useMutation } from '@tanstack/react-query'
import { queryClient } from '../lib/react-query'

// Fetch all auctions
export function useAuctions(filters = {}) {
  return useQuery({
    queryKey: ['auctions', filters],
    queryFn: async () => {
      const response = await fetch('/wp-json/wp/v2/auction', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-API-Key': window.wpApiSettings?.apiKey || ''
        },
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Network response was not ok')
      return response.json()
    }
  })
}

// Fetch single auction
export function useAuction(id) {
  return useQuery({
    queryKey: ['auction', id],
    queryFn: async () => {
      const response = await fetch(`/wp-json/wp/v2/auction/${id}`)
      if (!response.ok) throw new Error('Network response was not ok')
      return response.json()
    },
    enabled: !!id
  })
}

// Mutate auction (create/update)
export function useAuctionMutation() {
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/wp-json/wp/v2/auction${id ? `/${id}` : ''}`, {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.wpApiSettings?.nonce
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Network response was not ok')
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch auctions list
      queryClient.invalidateQueries({ queryKey: ['auctions'] })
    }
  })
}
