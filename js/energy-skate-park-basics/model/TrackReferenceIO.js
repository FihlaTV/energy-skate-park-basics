// Copyright 2017-2018, University of Colorado Boulder

/**
 * The skater stores a reference to the track it is on, or null if in the air or ground.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var energySkateParkBasics = require( 'ENERGY_SKATE_PARK_BASICS/energySkateParkBasics' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var ObjectIO = require( 'ifphetio!PHET_IO/types/ObjectIO' );
  var phetio = require( 'ifphetio!PHET_IO/phetio' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * @param {Track} track
   * @param {string} phetioID
   * @constructor
   */
  function TrackReferenceIO( track, phetioID ) {
    assert && assertInstanceOf( track, phet.energySkateParkBasics.Track );
    ObjectIO.call( this, track, phetioID );
  }

  phetioInherit( ObjectIO, 'TrackReferenceIO', TrackReferenceIO, {}, {
    toStateObject: function( track ) {
      assert && assertInstanceOf( track, phet.energySkateParkBasics.Track );
      return track ? track.trackTandem.phetioID : null;
    },
    fromStateObject: function( stateObject ) {
      if ( stateObject === null ) {
        return null;
      }
      if ( phetio.hasInstance( stateObject ) ) {
        return phetio.getInstance( stateObject );
      }
      else {
        throw new Error( 'fromStateObject failed' );
      }
    }
  } );

  energySkateParkBasics.register( 'TrackReferenceIO', TrackReferenceIO );

  return TrackReferenceIO;
} );