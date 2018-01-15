import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash';

import {XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  LineMarkSeries, LineSeries, WhiskerSeries,MarkSeries} from 'react-vis';
  
const inverval = 12;

class App extends Component {
  constructor(props){
    super(props);
    this.addDates = this.addDates.bind(this);
    this.state = {
      data:{
				bit2cData:[],
				bit2cBid:[],
        bitfinexcData: [],
				transactionsBuyPoints:[],
				transactionsSellPoints:[],
				bitfinexcBuyPoints:[],
				bitfinexcSellPoints:[],
				averagePoints:[],
				averageBuyPoints:[],
				averageSellPoints:[],
        fromDate:new Date('2017-12-24T12:00:00.000'),
				toDate : new Date('2017-12-25T00:00:00.000')  
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
    return {x:point.x, y:1.2, yVariance: 1};
  }

  toTransactionPoints(transaction) {
		transaction.bid = transaction.bid * 3.5;
		transaction.ask = transaction.ask * 3.5;

    return {
			x:new Date(transaction.date).getTime(),
			y:transaction.price * 3.5,
			size :"30",
			transaction: transaction
		};
  }

  toNisPoint(ticker) {
    return {x:new Date(ticker.date).getTime(), y:ticker.ask * 3.5};
	}

	toAverage(ticker) {
    return {x:new Date(ticker.date).getTime(), y:ticker.ask * 3.5};
  }

  componentWillMount(){
    axios.get('http://localhost:5000/tickers?fromDate='+ this.state.data.fromDate + '&toDate=' + this.state.data.toDate)
    .then(response => {
      var bit2cTickers = response.data.bit2cTickers;
      var bitfinexTickers = response.data.bitfinexTickers;
			var bit2cData = _.map(bit2cTickers, this.toPoint);
			var bit2cBid = _.map(bit2cTickers, this.toPointBid);
			var bitfinexcData = _.map(bitfinexTickers, this.toNisPoint);
			var bitfinex = _.map(bitfinexTickers, this.toNisPoint);
			var bitfinexcBuyPoints = [];
			var bitfinexcSellPoints = [];
			var averagePoints = [];

			for (let i = 0; i < response.data.bit2cTickers.length; i++) {
				var average = response.data.bit2cTickers[i].bid / (response.data.bitfinexTickers[i].bid *  3.5);
				averagePoints.push({x:new Date(response.data.bit2cTickers[i].date).getTime(),y:average});
			}

			for (let i = 0; i < this.state.data.transactionsBuyPoints.length; i++) {
				let buyX = this.state.data.transactionsBuyPoints[i].x;
				let transaction = this.state.data.transactionsBuyPoints[i].transaction;
				let buyPoint = _.find(bitfinexcData, function(o) { return o.x === buyX; });
				let newTransacrion = {
					price:transaction.price,
					bid:buyPoint.y,
					ask:buyPoint.y,
					volume:transaction.volume,
					date:transaction.date,
					ratio:transaction.ratio
				}

				buyPoint["transaction"] = newTransacrion;
				bitfinexcBuyPoints.push(buyPoint);
			}

			for (let i = 0; i < this.state.data.transactionsSellPoints.length; i++) {
				let buyX = this.state.data.transactionsSellPoints[i].x;
				let transaction = this.state.data.transactionsBuyPoints[i].transaction;
				let buyPoint = _.find(bitfinexcData, function(o) { return o.x === buyX; });
				let newTransacrion = {
					price:transaction.price,
					bid:buyPoint.y * 3.5,
					ask:buyPoint.y * 3.5,
					volume:transaction.volume,
					date:transaction.date,
					ratio:transaction.ratio
				}

				buyPoint["transaction"] = newTransacrion;
				bitfinexcSellPoints.push(buyPoint);
			}

			var averageData = _.map(response.data.bit2cTickers, this.toNisPoint);

      this.setState(prevState => ({
        data: {
          bit2cData:bit2cData,
          bitfinexcData:bitfinexcData,
					transactionsBuyPoints:prevState.data.transactionsBuyPoints,
					transactionsSellPoints:prevState.data.transactionsSellPoints,
					bitfinexcBuyPoints:bitfinexcBuyPoints,
					bitfinexcSellPoints:bitfinexcSellPoints,
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
    newToDate.setHours(this.state.data.toDate.getHours() + inverval);

    var newfromDate = this.state.data.fromDate;
    newfromDate.setHours(this.state.data.fromDate.getHours() + inverval);

    this.setState(prevState => ({
      data: {
        bit2cData:prevState.data.bit2cData,
        bitfinexcData:prevState.data.bitfinexcData,
        transactionsBuyPoints:prevState.data.transactionsBuyPoints,
				transactionsSellPoints:prevState.data.transactionsSellPoints,
				bitfinexcSellPoints:prevState.data.bitfinexcSellPoints,
				bitfinexcBuyPoints:prevState.data.bitfinexcBuyPoints,
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
          <LineMarkSeries data={this.state.data.transactionsBuyPoints} onValueClick={this.showTickerData} className="transactionsBuyPoints"/>
					<LineMarkSeries data={this.state.data.transactionsSellPoints} onValueClick={this.showTickerData} className="transactionsSellPoints"/>
					<LineMarkSeries data={this.state.data.bitfinexcSellPoints} onValueClick={this.showTickerData} className="bitfinexcSellPoints"/>
					<LineMarkSeries data={this.state.data.bitfinexcBuyPoints} onValueClick={this.showTickerData} className="bitfinexcBuyPoints" />
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
					<LineSeries className="average" data={this.state.data.averagePoints} style={{stroke: 'black'}}/> 
					<WhiskerSeries className="whisker-series-example" data={this.state.data.averageBuyPoints} />
					<WhiskerSeries className="whisker-series-example" data={this.state.data.averageSellPoints} />
      	</XYPlot>

      </div>

    );
  }
}

export default App;
