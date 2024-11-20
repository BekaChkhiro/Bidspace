// File: admin-dashboard/assets/js/admin-dashboard.js

jQuery(document).ready(function($) {
  // Handle auction actions
  function handleAuctionAction(auctionId, action) {
      $.ajax({
          url: adminDashboard.ajaxUrl,
          type: 'POST',
          data: {
              action: 'handle_admin_auction_actions',
              nonce: adminDashboard.nonce,
              auction_id: auctionId,
              auction_action: action
          },
          success: function(response) {
              if (response.success) {
                  // Refresh the table or show success message
                  location.reload();
              } else {
                  alert('Error: ' + response.data);
              }
          },
          error: function() {
              alert('Server error occurred');
          }
      });
  }

  // Search functionality
  let searchTimer;
  $('#auction-search').on('input', function() {
      clearTimeout(searchTimer);
      const query = $(this).val();

      if (query.length > 2) {
          searchTimer = setTimeout(function() {
              $.ajax({
                  url: adminDashboard.ajaxUrl,
                  type: 'POST',
                  data: {
                      action: 'search_auctions',
                      nonce: adminDashboard.nonce,
                      query: query
                  },
                  success: function(response) {
                      $('#auction-list').html(response);
                  }
              });
          }, 500);
      }
  });

  // Filter handling
  $('#status-filter').on('change', function() {
      const status = $(this).val();
      refreshTable({ status: status });
  });

  // Table refresh
  function refreshTable(filters = {}) {
      $.ajax({
          url: adminDashboard.ajaxUrl,
          type: 'POST',
          data: {
              action: 'get_auction_table',
              nonce: adminDashboard.nonce,
              ...filters
          },
          success: function(response) {
              $('#auction-list').html(response);
          }
      });
  }

  // Initialize tooltips
  $('[data-tooltip]').tooltip();

  // Handle bulk actions
  $('#bulk-action-apply').on('click', function() {
      const action = $('#bulk-action-selector').val();
      const selected = $('.auction-checkbox:checked').map(function() {
          return $(this).val();
      }).get();

      if (selected.length === 0) {
          alert('Please select items first');
          return;
      }

      handleBulkAction(action, selected);
  });

  function handleBulkAction(action, items) {
      $.ajax({
          url: adminDashboard.ajaxUrl,
          type: 'POST',
          data: {
              action: 'handle_bulk_actions',
              nonce: adminDashboard.nonce,
              bulk_action: action,
              items: items
          },
          success: function(response) {
              if (response.success) {
                  location.reload();
              } else {
                  alert('Error: ' + response.data);
              }
          }
      });
  }

  // Date range picker initialization
  if ($.fn.daterangepicker) {
      $('.date-range-picker').daterangepicker({
          ranges: {
              'Today': [moment(), moment()],
              'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
              'Last 7 Days': [moment().subtract(6, 'days'), moment()],
              'Last 30 Days': [moment().subtract(29, 'days'), moment()],
              'This Month': [moment().startOf('month'), moment().endOf('month')],
              'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
          },
          locale: {
              format: 'YYYY-MM-DD'
          }
      });
  }

  // Export functionality
  $('#export-data').on('click', function() {
      const format = $('#export-format').val();
      window.location.href = `${adminDashboard.ajaxUrl}?action=export_auction_data&format=${format}&nonce=${adminDashboard.nonce}`;
  });
});