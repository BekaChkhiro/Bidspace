<!DOCTYPE html>
<html <?php language_attributes(); ?>>
  <head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://*.google.com https://*.googleapis.com https://*.firebaseapp.com; frame-src 'self' https://www.google.com https://*.firebaseapp.com; connect-src 'self' https://*.googleapis.com https://*.google.com https://*.firebaseio.com https://*.cloudfunctions.net">
    <link rel="manifest" href="<?php echo get_template_directory_uri(); ?>/public/manifest.json">
    <?php wp_head(); ?>
  </head>
  <body <?php body_class(); ?>>
    <div class="bg-gray-300">
      <div class="max-w-4xl mx-auto mb-5 px-4">
        <h1 class="text-3xl py-10"><a href="<?php echo get_home_url(); ?>" class="hover:text-blue-500">Welcome To Our Header!</a></h1>
      </div>
    </div>