import React, { Component } from 'react'
import getWeb3 from './utils/getWeb3'
import './App.css'
import './css/demo.css'
import './css/normalize.css'
import './css/webflow.css'

class WagerForm  extends Component {
    constructor(props) {
        super(props)
        this.state = {
            web3: null,
            username: '',
            amountOfEthWager: '',
            account0: '',
            account0Balance: 0
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillMount() {
        // Get network provider and web3 instance.
        // See utils/getWeb3 for more info.

        getWeb3
        .then(results => {
            this.setState({
                web3: results.web3
            })

            // Instantiate contract once web3 provided.
            this.instantiateContract()
        })
        .catch(() => {
            alert('Error finding web3.')
        })
    }

    getBalance (address) {
        return new Promise (function (resolve, reject) {
          window.web3.eth.getBalance(address, function (error, result) {
            if (error) {
              reject(error);
            } else {
              resolve(result);
              }
          })
        })
      }

    instantiateContract() {
        /*
         * SMART CONTRACT EXAMPLE
         *
         * Normally these functions would be called in the context of a
         * state management library, but for convenience I've placed them here.
         */

         /*
        const contract = require('truffle-contract')
        const simpleStorage = contract(SimpleStorageContract)
        simpleStorage.setProvider(this.state.web3.currentProvider)
    
        // Declaring this for later so we can chain functions on SimpleStorage.
        var simpleStorageInstance
        */

        // Get accounts.
        this.state.web3.eth.getAccounts((error, accounts) => {
            this.setState({ account0: accounts[0] })
            this.getBalance(accounts[0]).then((result) => {
                
                var balance = this.state.web3.utils.fromWei(result.toString(), 'ether')
                //alert('getBalance ' + balance);
                this.setState({ account0Balance: balance })
            });
            /*
            simpleStorage.deployed().then((instance) => {
                simpleStorageInstance = instance
    
                // Stores a given value, 5 by default.
                return simpleStorageInstance.set(5, {from: accounts[0]})
            }).then((result) => {
                // Get the value from the contract to prove it worked.
                return simpleStorageInstance.get.call(accounts[0])
            }).then((result) => {
                // Update state with the result.
                return this.setState({ storageValue: result.c[0] })
            })
            */
        })
    }

    handleInputChange(event) {
        const target = event.target;
        const name = target.name;
        const value = target.value;

        this.setState({
            [name]: value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    render() {
        return(
            <div class="WagerForm">
            <div class="timertext_div w-clearfix">
                <div class="address_text">ADDRESS:</div>
            </div>
            <div class="timertext_div w-clearfix">
                <div class="address">{this.state.account0}</div>
            </div>
            <div class="timertext_div w-clearfix">
                <div class="address_text">BALANCE:</div>
            </div>
            <div class="timertext_div w-clearfix">
                <div class="address">{this.state.account0Balance} ETH</div>
            </div>
            <form id="contest-form" name="contest-form" class="join-form" onSubmit={this.handleSubmit}>
                <label for="name">Username</label>
                <input type="text" class="w-input" maxlength="256" name="username" placeholder="Enter username. For leaderboard display" id="username"
                    value={this.state.username}
                    onChange={this.handleInputChange} />
                <label for="wager">Wager Amount</label>
                <input type="number" class="w-input" maxlength="256" name="amountOfEthWager" id="ethwager" required=""
                    value={this.state.amountOfEthWager}
                    onChange={this.handleInputChange} />
                <input type="submit" value="Submit" class="w-button" />
            </form>
            </div>
        );
    }
}

class App extends Component {
    render() {
        return (
            <div>
            <div data-w-id="ff392bad-c758-56a2-04d5-d7ccbf7aae89" class="overlay">
            </div>
            <div class="wrapper w-clearfix">
                <div class="gamestatus_div w-clearfix">
                <div class="status_container">
                <div class="logo"></div>
                    <div class="status_row w-row">
                    <div class="status_column w-col w-col-4" data-ix="hover-status">
                        <div class="status_box" data-ix="status-fade">
                        <div class="counter">12</div>
                        </div>
                        <div class="status_text" data-ix="hover-status">Upcoming</div>
                    </div>
                    <div class="status_column w-col w-col-4">
                        <div class="status_box" data-ix="status-fade">
                        <div class="counter">08</div>
                        </div>
                        <div class="status_text" data-ix="hover-status">In Progress</div>
                    </div>
                    <div class="status_column w-col w-col-4">
                        <div class="status_box" data-ix="status-fade">
                        <div class="counter">06</div>
                        </div>
                    <div class="status_text" data-ix="hover-status">Completed</div>
                    </div>
                </div>
                </div>
            </div>
            <div class="contest_wrapper">
                <div class="game_container w-clearfix">
                <div class="game-header-div">
                    <div class="game_header"><span class="contract-link"></span><span class="link_contract"></span> AGON PUBLIC CONTEST #0</div>
                </div>
                <div class="game-info-div w-clearfix">
                    <div class="game_row w-row">
                    <div class="game_column w-col w-col-3">
                        <div class="info_icon"></div>
                        <div class="info">PLAYERS</div>
                    </div>
                    <div class="game_column w-col w-col-3">
                        <div class="info_text">2,478</div>
                    </div>
                    <div class="game_column w-col w-col-3">
                        <div class="info_icon"></div>
                        <div class="info">RULE</div>
                    </div>
                    <div class="game_column w-col w-col-3">
                        <div class="info_text">Top 20% Players</div>
                    </div>
                    </div>
                    <div class="game_row w-row">
                    <div class="game_column w-col w-col-3">
                        <div class="info_icon"></div>
                        <div class="info">PRIZE POOL</div>
                    </div>
                    <div class="game_column w-col w-col-3">
                        <div class="info_text">201.3 ETH</div>
                    </div>
                    <div class="game_column w-col w-col-3">
                        <div class="info_icon"></div>
                        <div class="info">DURATION</div>
                    </div>
                    <div class="game_column w-col w-col-3">
                        <div class="info_text">72 Hours</div>
                    </div>
                    </div>
                </div>
                <div class="timer_div">
                    <div class="timertext_div w-clearfix">
                    <div class="timer_text">BETTING ENDS IN</div>
                    <div class="time">13:05:23</div>
                    </div>
                    <div class="timer_counter w-clearfix">
                    <div class="time_past"></div>
                    <div class="time_left"></div>
                    </div>
                <WagerForm />
                </div>
                </div>
            </div>
            </div>
        </div>
        );
    }
}

export default App;
