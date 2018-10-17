// Copyright 2013-2017, University of Colorado Boulder

/**
 * Scenery node that shows the legend for the pie chart, and a reset button for thermal energy.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var ClearThermalButton = require( 'SCENERY_PHET/ClearThermalButton' );
  var energySkateParkBasics = require( 'ENERGY_SKATE_PARK_BASICS/energySkateParkBasics' );
  var EnergySkateParkColorScheme = require( 'ENERGY_SKATE_PARK_BASICS/energy-skate-park-basics/view/EnergySkateParkColorScheme' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );

  // strings
  var energyEnergyString = require( 'string!ENERGY_SKATE_PARK_BASICS/energy.energy' );
  var energyKineticString = require( 'string!ENERGY_SKATE_PARK_BASICS/energy.kinetic' );
  var energyPotentialString = require( 'string!ENERGY_SKATE_PARK_BASICS/energy.potential' );
  var energyThermalString = require( 'string!ENERGY_SKATE_PARK_BASICS/energy.thermal' );

  /**
   * @param {Property} allowClearingThermalEnergyProperty
   * @param {Function} clearThermal function to be called when the user presses the clear thermal button
   * @param {Property.<boolean>} pieChartVisibleProperty axon Property indicating whether the pie chart is visible
   * @param {Tandem} tandem
   * @constructor
   */
  function PieChartLegend( allowClearingThermalEnergyProperty, clearThermal, pieChartVisibleProperty, tandem ) {

    // The x-coordinate of a bar chart bar
    var createLabel = function( index, title, color, tandemName ) {
      return new Text( title, {
        tandem: tandem.createTandem( tandemName ),
        fill: color,
        font: new PhetFont( 12 ),
        pickable: false,
        maxWidth: 97 // selected by choosing the length of widest English string in ?stringTest=double
      } );
    };

    var createBar = function( index, color ) {
      return new Rectangle( 0, 0, 16.5, 16.5, {
        fill: color,
        stroke: 'black',
        lineWidth: 1
      } );
    };

    var kineticBar = createBar( 0, EnergySkateParkColorScheme.kineticEnergy );
    var potentialBar = createBar( 1, EnergySkateParkColorScheme.potentialEnergy );
    var thermalBar = createBar( 2, EnergySkateParkColorScheme.thermalEnergy );

    var kineticLabel = createLabel( 0, energyKineticString, EnergySkateParkColorScheme.kineticEnergy, 'kineticEnergyLabel' );
    var potentialLabel = createLabel( 1, energyPotentialString, EnergySkateParkColorScheme.potentialEnergy, 'potentialEnergyLabel' );
    var thermalLabel = createLabel( 2, energyThermalString, EnergySkateParkColorScheme.thermalEnergy, 'thermalEnergyLabel' );

    var clearThermalButton = new ClearThermalButton( {
      tandem: tandem.createTandem( 'clearThermalButton' ),
      listener: clearThermal,
      centerX: thermalLabel.centerX,
      y: thermalLabel.bottom + 15
    } );
    allowClearingThermalEnergyProperty.link( function( allowClearingThermalEnergy ) {
      clearThermalButton.enabled = allowClearingThermalEnergy;
    } );

    // Don't let the ClearThermalButton participate in the layout since it is too big vertically.  Just use a strut to
    // get the width right, then add the undo button later
    var clearThermalButtonStrut = new Rectangle( 0, 0, clearThermalButton.width, 1, {} );

    var contentNode = new VBox( {
      spacing: 10, align: 'left', children: [
        new HBox( { spacing: 4, children: [ kineticBar, kineticLabel ] } ),
        new HBox( { spacing: 4, children: [ potentialBar, potentialLabel ] } ),
        new HBox( {
          spacing: 4,
          children: [ thermalBar, thermalLabel, new HStrut( 1 ), clearThermalButtonStrut, new HStrut( 3 ) ]
        } ),
        new VStrut( 1 )
      ]
    } );

    var titleNode = new Text( energyEnergyString, {
      tandem: tandem.createTandem( 'titleNode' ),
      fill: 'black',
      font: new PhetFont( 14 ),
      pickable: false,
      maxWidth: 93 // selected by choosing the length of widest English string in ?stringTest=double
    } );
    var contentWithTitle = new VBox( {
      spacing: 5, align: 'center', children: [
        titleNode,
        contentNode
      ]
    } );

    Panel.call( this, contentWithTitle,
      {
        x: 4,
        y: 4,
        xMargin: 6,
        yMargin: 5,
        fill: 'white',
        stroke: 'gray',
        lineWidth: 1,
        resize: false,
        tandem: tandem
      } );

    this.addChild( clearThermalButton );
    var strutGlobal = clearThermalButtonStrut.parentToGlobalPoint( clearThermalButtonStrut.center );
    var buttonLocal = clearThermalButton.globalToParentPoint( strutGlobal );
    clearThermalButton.center = buttonLocal;

    pieChartVisibleProperty.linkAttribute( this, 'visible' );
  }

  energySkateParkBasics.register( 'PieChartLegend', PieChartLegend );

  return inherit( Panel, PieChartLegend );
} );