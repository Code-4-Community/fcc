<?php
/**
 * Plugin Name: FCC Donation Embed
 * Description: Embeds the FCC donation form and growing goal via the [fcc_donation] shortcode.
 * Version: 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Shortcode: [fcc_donation api_url="https://your-backend.com"]
 *
 * The api_url attribute is optional. If omitted, the embed defaults to
 * same-origin (i.e. the backend must be served from the same host as WordPress).
 */
function fcc_donation_shortcode( $atts ) {
    $atts = shortcode_atts(
        [ 'api_url' => '' ],
        $atts,
        'fcc_donation'
    );

    $assets_dir = plugin_dir_path( __FILE__ ) . 'assets/';
    $css_path   = $assets_dir . 'fcc-donation.css';
    $js_path    = $assets_dir . 'fcc-donation.iife.js';

    // Use file mtime as the version so any change to the asset (via Plugin File
    // Editor or otherwise) busts browser, CDN, and WordPress object caches.
    $css_version = file_exists( $css_path ) ? filemtime( $css_path ) : '1.0.0';
    $js_version  = file_exists( $js_path )  ? filemtime( $js_path )  : '1.0.0';

    wp_enqueue_style(
        'fcc-donation',
        plugins_url( 'assets/fcc-donation.css', __FILE__ ),
        [],
        $css_version
    );

    wp_enqueue_script(
        'fcc-donation',
        plugins_url( 'assets/fcc-donation.iife.js', __FILE__ ),
        [],
        $js_version,
        true // load in footer so the DOM is ready
    );

    if ( ! empty( $atts['api_url'] ) ) {
        wp_add_inline_script(
            'fcc-donation',
            'window.__FCC_DONATION_API_URL__ = ' . wp_json_encode( $atts['api_url'] ) . ';',
            'before'
        );
    }

    return '<div id="fcc-donation-embed"></div>';
}

add_shortcode( 'fcc_donation', 'fcc_donation_shortcode' );
