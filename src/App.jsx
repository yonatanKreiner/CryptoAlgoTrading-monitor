import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash';

import {XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
	LineMarkSeries, LineSeries} from 'react-vis';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      data:{
				bit2cData:[],
				bit2cBid:[],
        bitfinexcData: [],
				transactionsBuyPoints:[],
				transactionsSellPoints:[],
				fromDate:new Date('2017-12-24T10:28:46.007Z'),
				toDate : new Date('2017-12-24T10:36:46.007Z')
      }
    }
  }

  toPoint(ticker) {
    return {x:new Date(ticker.date).getTime(), y:ticker.ask};
	}
	
	toPointBid(ticker) {
    return {x:new Date(ticker.date).getTime(), y:ticker.bid};
  }

  toTransactionPoints(transaction) {
    return {x:new Date(transaction.date).getTime(), y:transaction.price * 3.49, transaction:transaction};
  }

  toNisPoint(ticker) {
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
      this.setState(prevState => ({
        data: {
          bit2cData:bit2cData,
          bitfinexcData:bitfinexcData,
					transactionsBuyPoints:prevState.data.transactionsBuyPoints,
					transactionsSellPoints:prevState.data.transactionsSellPoints,
					bit2cBid:bit2cBid
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
      
      this.setState({
        data:{
					transactionsBuyPoints:transactionsBuyPoints,
					transactionsSellPoints:transactionsSellPoints
        }
      });
    })
  }

  showTickerData(datapoint, event){
    alert(JSON.stringify(datapoint.transaction));
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
        <XYPlot xType="time" width={7000} height={1100} >
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis />
          <YAxis />
          <LineMarkSeries data={this.state.data.transactionsBuyPoints} onValueClick={this.showTickerData} className="transactionsBuyPoints" style={{stroke: 'white'}}/>
					<LineMarkSeries data={this.state.data.transactionsSellPoints} onValueClick={this.showTickerData} className="transactionsSellPoints" style={{stroke: 'white'}}/>
          <LineSeries className="bitfinexLine" data={this.state.data.bitfinexcData}/> 
          <LineSeries className="bit2cLine" data={this.state.data.bit2cData}/> 
					<LineSeries className="bit2cLineBid" data={this.state.data.bit2cBid}/> 
      </XYPlot>
      </div>
    );
  }
}

export default App;
