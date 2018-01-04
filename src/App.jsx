import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash';

import {XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  LineMarkSeries, LineSeries} from 'react-vis';
  
const inverval = 60;

class App extends Component {
  constructor(props){
    super(props);
    this.addDates = this.addDates.bind(this);
    this.state = {
      data:{
				bit2cData:[],
				bit2cBid:[],
        bitfinexcData: [],
				transactionsBuyPoints:[ ],
				transactionsSellPoints:[],
				averagePoints:[],
				averageBuyPoints:[],
				averageSellPoints:[],
        fromDate:new Date('2017-12-24T12:28:46.007'),
				toDate : new Date('2017-12-24T13:28:46.007')  
      }
    }
  }

  toPoint(ticker) {
    return {x:new Date(ticker.date).getTime(), y:ticker.ask};
	}
	
	toPointBid(ticker) {
    return {x:new Date(ticker.date).getTime(), y:ticker.bid};
	}
	
	toAveragePoint(point) {
    return {x:point.x, y:1.2};
  }

  toTransactionPoints(transaction) {
    return {x:new Date(transaction.date).getTime(), y:transaction.price * 3.49, transaction:transaction};
  }

  toNisPoint(ticker) {
    return {x:new Date(ticker.date).getTime(), y:ticker.ask * 3.49};
	}

	toAverage(ticker) {
    return {x:new Date(ticker.date).getTime(), y:ticker.ask * 3.49};
  }

  componentWillMount(){
    axios.get('http://localhost:5000/tickers?fromDate='+ this.state.data.fromDate + '&toDate=' + this.state.data.toDate)
    .then(response => {
      var bit2cTickers = response.data.bit2cTickers;
      var bitfinexTickers = response.data.bitfinexTickers;
			var bit2cData = _.map(bit2cTickers, this.toPoint);
			var bit2cBid = _.map(bit2cTickers, this.toPointBid);
			var bitfinexcData = _.map(bitfinexTickers, this.toNisPoint);
			var averagePoints = [];

			for (var i = 0; i < response.data.bit2cTickers.length; i++) {
				var average = response.data.bit2cTickers[i].ask / (response.data.bitfinexTickers[i].ask *  3.49);
				averagePoints.push({x:new Date(response.data.bit2cTickers[i].date).getTime(),y:average});
			}

			var averageData = _.map(response.data.bit2cTickers, this.toNisPoint);

      this.setState(prevState => ({
        data: {
          bit2cData:bit2cData,
          bitfinexcData:bitfinexcData,
					transactionsBuyPoints:prevState.data.transactionsBuyPoints,
					transactionsSellPoints:prevState.data.transactionsSellPoints,
					bit2cBid:bit2cBid,
					averagePoints:averagePoints,
					averageBuyPoints: prevState.data.averageBuyPoints,
					averageSellPoints:prevState.data.averageSellPoints,
          fromDate:prevState.data.fromDate,
          toDate :prevState.data.toDate
        }
      }))

      console.log(this.state.data);
    })

    axios.get('http://localhost:5000/transactions?fromDate='+ this.state.data.fromDate + '&toDate=' + this.state.data.toDate)
    .then(response => {
			var buyTransactions = _.map(response.data, (transaction)=>{return transaction.buy} );
			var sellTransactions = _.map(response.data, (transaction)=>{return transaction.sell} );
			var transactionsBuyPoints = _.map(buyTransactions, this.toTransactionPoints);
			var transactionsSellPoints = _.map(sellTransactions, this.toTransactionPoints);
			var averageBuyPoints = _.map(transactionsBuyPoints, this.toAveragePoint);
			var averageSellPoints = _.map(transactionsSellPoints, this.toAveragePoint);

      this.setState(prevState => ({
        data: {
					transactionsBuyPoints:transactionsBuyPoints,
					transactionsSellPoints:transactionsSellPoints,
					fromDate:prevState.data.fromDate,
					averageBuyPoints:averageBuyPoints,
					averageSellPoints:averageSellPoints,
          toDate :prevState.data.toDate
        }
      }))
    })
  }

  showTickerData(datapoint, event){
    alert(JSON.stringify(datapoint.transaction));
  }

  addDates(){
    var newToDate = this.state.data.toDate;
    newToDate.setMinutes(this.state.data.toDate.getMinutes() + inverval);

    var newfromDate = this.state.data.fromDate;
    newfromDate.setMinutes(this.state.data.fromDate.getMinutes() + inverval);

    this.setState(prevState => ({
      data: {
        bit2cData:prevState.data.bit2cData,
        bitfinexcData:prevState.data.bitfinexcData,
        transactionsBuyPoints:prevState.data.transactionsBuyPoints,
        transactionsSellPoints:prevState.data.transactionsSellPoints,
				bit2cBid:prevState.data.bit2cBid,
				averagePoints:prevState.averagePoints,
        fromDate:newfromDate,
        toDate:newToDate
      }
    }))

    this.componentWillMount();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src="https://www.canbike.org/public/images/030114/Bitcoin_Logo.svg" className="App-logo" alt="logo" />
          <h1 className="App-title">BitTeam Charts</h1>
        </header>
        <p className="App-intro">
          Bit2c vs Bitterex
        </p>
        <button onClick={this.addDates}>Pass Interval</button>
        <input type="text" value={this.state.data.fromDate}  />
        <input type="text" value={this.state.data.toDate} />
        <XYPlot xType="time" width={7000} height={1100} >
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis />
          <YAxis />
          <LineMarkSeries data={this.state.data.transactionsBuyPoints} onValueClick={this.showTickerData} className="transactionsBuyPoints" style={{stroke: 'white'}}/>
					<LineMarkSeries data={this.state.data.transactionsSellPoints} onValueClick={this.showTickerData} className="transactionsSellPoints" style={{stroke: 'white'}}/>
					<LineSeries className="bitfinexLine" data={this.state.data.bitfinexcData} style={{stroke: 'yellow'}}/> 
          <LineSeries className="bit2cLine" data={this.state.data.bit2cData} style={{stroke: 'blue'}}/> 
					<LineSeries className="bit2cLineBid" data={this.state.data.bit2cBid} style={{stroke: 'red'}}/> 
      	</XYPlot>

			<div style={{backgroundColor:'blue'}}>
			<h1 style={{backgroundColor:'blue'}}>Bit2c ASK</h1>
			</div>
			<div style={{backgroundColor:'red'}}>
			<h1 style={{backgroundColor:'red'}}>Bit2c Bid</h1>
			</div>
			<div style={{backgroundColor:'yellow'}}>
			<h1 style={{backgroundColor:'yellow'}}>Bitfinex ASK</h1>
			</div>

			<XYPlot xType="time" width={7000} height={1100} >
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis />
          <YAxis />
					<LineMarkSeries data={this.state.data.averageBuyPoints} className="averageBuyPoints" style={{stroke: 'white'}}/>
					<LineMarkSeries data={this.state.data.averageSellPoints}  className="transactionsSellPoints" style={{stroke: 'white'}}/>
					<LineSeries className="average" data={this.state.data.averagePoints} style={{stroke: 'black'}}/> 
      	</XYPlot>


      </div>

    );
  }
}

export default App;
