// Copyright 2013-2018, University of Colorado Boulder

/**
 * Scenery node for the pie chart, which moves with the skater and shows a pie chart representation of the energies by
 * type. The size of the pie chart is proportional to the total energy.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Constants = require( 'ENERGY_SKATE_PARK_BASICS/energy-skate-park-basics/Constants' );
  var energySkateParkBasics = require( 'ENERGY_SKATE_PARK_BASICS/energySkateParkBasics' );
  var EnergySkateParkColorScheme = require( 'ENERGY_SKATE_PARK_BASICS/energy-skate-park-basics/view/EnergySkateParkColorScheme' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );

  /**
   * @param {Skater} skater the skater model
   * @param {Property<Boolean>} pieChartVisibleProperty axon Property indicating whether the pie chart is shown
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   * @constructor
   */
  function PieChartNode( skater, pieChartVisibleProperty, graphScaleProperty, modelViewTransform, tandem ) {
    var self = this;

    var kineticEnergySlice = new Path( null, {
      fill: EnergySkateParkColorScheme.kineticEnergy,
      stroke: 'black',
      lineWidth: 1,
      tandem: tandem.createTandem( 'kineticEnergySlicePath' )
    } );
    var potentialEnergySlice = new Path( null, {
      fill: EnergySkateParkColorScheme.potentialEnergy,
      stroke: 'black',
      lineWidth: 1,
      tandem: tandem.createTandem( 'potentialEnergySlicePath' )
    } );

    // Skip bounds computation to improve performance, see #245
    kineticEnergySlice.computeShapeBounds = function() {return new Bounds2( 0, 0, 0, 0 );};
    potentialEnergySlice.computeShapeBounds = function() {return new Bounds2( 0, 0, 0, 0 );};

    // Back layer is always a circle, so use the optimized version.
    var thermalEnergySlice = new Circle( 1, {
      fill: EnergySkateParkColorScheme.thermalEnergy,
      stroke: 'black',
      lineWidth: 1
    } );
    Node.call( this, {
      tandem: tandem,
      children: [ thermalEnergySlice, potentialEnergySlice, kineticEnergySlice ],
      pickable: false
    } );

    var updatePieChartLocation = function() {

      var view = modelViewTransform.modelToViewPosition( skater.headPositionProperty.value );

      // Center pie chart over skater's head not his feet so it doesn't look awkward when skating in a parabola
      self.setTranslation( view.x, view.y - 50 );
    };
    skater.headPositionProperty.link( function() {
      if ( self.visible ) {
        updatePieChartLocation();
      }
    } );

    var updatePaths = function() {

      // Guard against expensive changes while the pie chart is invisible
      if ( !self.visible ) {
        return;
      }
      var totalEnergy = skater.totalEnergyProperty.value;

      // Guard against negative total energy, which could occur of the user is dragging the track underground, see #166
      if ( totalEnergy < 0 ) {
        totalEnergy = 0;
      }

      // Make the radius proportional to the square root of the energy so that the area will grow linearly with energy
      var radius = 0.4 * Math.sqrt( totalEnergy );

      // If any value is too low, then don't show it, see #136
      var THRESHOLD = 1E-4;

      // if only one component of pie chart, then show as a circle so there are no seams
      var numberComponents = (skater.potentialEnergyProperty.value > THRESHOLD ? 1 : 0) +
                             (skater.kineticEnergyProperty.value > THRESHOLD ? 1 : 0) +
                             (skater.thermalEnergyProperty.value > THRESHOLD ? 1 : 0);

      // Don't show the pie chart if energies are zero, or if potential energy is negative (underground skater), see #189
      if ( numberComponents === 0 || skater.potentialEnergyProperty.value < 0 ) {
        potentialEnergySlice.visible = false;
        kineticEnergySlice.visible = false;
        thermalEnergySlice.visible = false;
      }
      else if ( numberComponents === 1 ) {
        var selectedSlice = skater.potentialEnergyProperty.value > THRESHOLD ? potentialEnergySlice :
                            skater.kineticEnergyProperty.value > THRESHOLD ? kineticEnergySlice :
                            thermalEnergySlice;
        potentialEnergySlice.visible = false;
        thermalEnergySlice.visible = false;
        kineticEnergySlice.visible = false;
        selectedSlice.visible = true;

        // Performance optimization for background circle
        if ( selectedSlice instanceof Circle ) {

          // Round the radius so it will only update the graphics when it changed by a px or more
          selectedSlice.radius = Math.round( radius );
        }
        else {
          selectedSlice.shape = Shape.circle( 0, 0, radius );
        }
      }
      else {
        potentialEnergySlice.visible = true;
        kineticEnergySlice.visible = true;
        thermalEnergySlice.visible = true;
        var fractionPotential = skater.potentialEnergyProperty.value / skater.totalEnergyProperty.value;
        var fractionKinetic = skater.kineticEnergyProperty.value / skater.totalEnergyProperty.value;

        // Show one of them in the background instead of pieces for each one for performance
        // Round the radius so it will only update the graphics when it changed by a px or more
        thermalEnergySlice.radius = Math.round( radius );

        // Start thermal at the right and wind counter clockwise, see #133
        // Order is thermal (in the background), kinetic, potential
        var potentialStartAngle = 0;
        var kineticStartAngle = Math.PI * 2 * fractionPotential;

        // If there is no potential energy (i.e. the skater is on the ground) then don't show the potential energy slice,
        // see #165
        if ( fractionPotential === 0 ) {
          potentialEnergySlice.shape = null;
        }
        else {
          potentialEnergySlice.shape = new Shape().moveTo( 0, 0 ).arc( 0, 0, radius, potentialStartAngle, kineticStartAngle, false ).lineTo( 0, 0 ).close();
        }
        kineticEnergySlice.shape = new Shape().moveTo( 0, 0 ).arc( 0, 0, radius, kineticStartAngle, kineticStartAngle + fractionKinetic * Math.PI * 2, false ).lineTo( 0, 0 ).close();
      }
    };

    // instead of changing the entire pie chart whenever one energy changes, use trigger to update the whole pie
    skater.energyChangedEmitter.addListener( updatePaths );

    // // Synchronize visibility with the model, and also update when visibility changes because it is guarded against in updatePaths
    // pieChartVisibleProperty.link( function( visible ) {
    //   self.visible = visible;
    //   updatePaths();
    //   if ( visible ) {
    //     updatePieChartLocation();
    //   }
    // } );

    // if too small or set to be invisible, hide the pie chart
    Property.multilink( [ pieChartVisibleProperty, skater.totalEnergyProperty, graphScaleProperty ], function( visible, totalEnergy, graphScale ) {
      var visibleAndLargeEnough = visible && ( totalEnergy > Constants.ALLOW_THERMAL_CLEAR_BASIS / graphScale );
      self.visible = visibleAndLargeEnough;

      updatePaths();
      if ( visibleAndLargeEnough ) {
        updatePieChartLocation();
      }
    } );
  }

  energySkateParkBasics.register( 'PieChartNode', PieChartNode );

  return inherit( Node, PieChartNode );
} );