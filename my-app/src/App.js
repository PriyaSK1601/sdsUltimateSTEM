import React from 'react';
import ReactDOM from 'react-dom/client';
import TodoItem from './Todoitem';
import './App.css';

export default class App extends React.Component{
    render(){
        return (
        <div className = "container"> 
            <div className = 'mt-3 mb-5'>To-Do Creation</div>
                <div>
                    <TodoItem 
                        title="Item 1" 
                        description="Description of item 1" 
                        completed={true}
                        />
                    <TodoItem 
                        title="Item 2"  
                        completed={false}
                        />
                </div> 
        </div>)
    }
}