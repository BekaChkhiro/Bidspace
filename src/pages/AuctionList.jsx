import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function AuctionList() {
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [debugResponse, setDebugResponse] = useState(null) // დებაგ ინფორმაციისთვის

  useEffect(() => {
    fetchAuctions()
  }, [])

  const fetchAuctions = async () => {
    try {
      const response = await fetch('/wp-json/wp/v2/auction')
      
      // შევინახოთ headers დებაგისთვის
      const debugHeaders = {}
      response.headers.forEach((value, key) => {
        debugHeaders[key] = value
      })
      
      // წავიკითხოთ პასუხი როგორც ტექსტი
      const responseText = await response.text()
      
      // შევინახოთ დებაგ ინფორმაცია
      setDebugResponse({
        status: response.status,
        statusText: response.statusText,
        headers: debugHeaders,
        body: responseText
      })

      // თუ პასუხი ცარიელი არ არის, ვცადოთ JSON-ად პარსინგი
      if (responseText) {
        try {
          const data = JSON.parse(responseText)
          if (Array.isArray(data)) {
            setAuctions(data)
            setLoading(false)
            return
          }
          throw new Error('მოსალოდნელია აუქციონების მასივი')
        } catch (jsonError) {
          throw new Error(`JSON პარსინგის შეცდომა: ${jsonError.message}`)
        }
      }
      
      throw new Error('ცარიელი პასუხი სერვერიდან')
      
    } catch (err) {
      console.error('აუქციონების ჩატვირთვის შეცდომა:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  if (loading) {
    return <div>იტვირთება...</div>
  }

  // თუ შეცდომაა, ვაჩვენოთ დებაგ ინფორმაცია
  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-4">შეცდომა: {error}</div>
        
        {debugResponse && (
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">Debug Information:</h3>
            <p>Status: {debugResponse.status} {debugResponse.statusText}</p>
            <div className="mb-2">
              <strong>Headers:</strong>
              <pre className="text-sm">
                {JSON.stringify(debugResponse.headers, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Response Body:</strong>
              <pre className="text-sm overflow-auto max-h-96">
                {debugResponse.body}
              </pre>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {auctions.map(auction => (
        <div 
          key={auction.id} 
          className="border rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow"
        >
          <h2 className="text-xl font-bold mb-2">
            {auction.title.rendered}
          </h2>
          
          <div className="mb-4 text-gray-600">
            <p>ქალაქი: {auction.meta.city}</p>
            <p>საწყისი ფასი: {auction.meta.auction_price}₾</p>
            <p>ბილეთის ფასი: {auction.meta.ticket_price}₾</p>
            <p>რაოდენობა: {auction.meta.ticket_quantity}</p>
          </div>

          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              დაწყება: {new Date(auction.meta.start_time).toLocaleDateString('ka-GE')}
            </div>
            <div>
              დასრულება: {new Date(auction.meta.due_time).toLocaleDateString('ka-GE')}
            </div>
          </div>

          <Link 
            to={`/auction/${auction.id}`}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors inline-block text-center"
          >
            დეტალების ნახვა
          </Link>
        </div>
      ))}
    </div>
  )
}

export default AuctionList