import Header from './Header';
import SearchItem from './SearchItem';
import AddItem from './AddItem';
import Content from './Content';
import Footer from './Footer';
import { useEffect, useState } from 'react';
import apiRequest from './apiRequest';

function App() {
  const API_URL='http://localhost:3500/items';
  useEffect(()=>{
    const fetchItems=async ()=>{
      try{
        const response=await fetch(API_URL);
        if(!response.ok){
          throw Error('Did not received expected Data...');
        }
        const listItems=await response.json();
        console.log(listItems);
        setItems(listItems);
        setFetchError(null);
      }
      catch(err){
        setFetchError(err.message);
      }
      finally{
        setLoading(false)
      } 
    }

    setTimeout(()=>{(async()=>await fetchItems())()},2000)
  },[])

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('')
  const [search, setSearch] = useState('')
  const [fetchError,setFetchError]=useState(null);
  const [isLoading,setLoading]=useState(true);

  const setAndSaveItems = (newItems) => {
    setItems(newItems);
    localStorage.setItem('shoppinglist', JSON.stringify(newItems));
  }

  const addItem = (item) => {
    const id = items.length ? items[items.length - 1].id + 1 : 1;
    const myNewItem = { id, checked: false, item };
    const listItems = [...items, myNewItem];
    setItems(listItems);
    const postOptions={
      method:"post",
      headers:{
        'content-type':'application/json'
      },
      body: JSON.stringify(myNewItem)
    }
    const result =apiRequest(API_URL,postOptions);
    if(!result) setFetchError(result);
  }

  const handleCheck = (id) => {
    const listItems = items.map((item) => item.id === id ? { ...item, checked: !item.checked } : item);
    setItems(listItems);
    const myItem=listItems.filter(item=>item.id===id);
    const updateOptions={
      method:'PATCH',
      headers:{
        'content-type':'application/json'
      },
      body:JSON.stringify({checked:myItem[0].checked})
    };
    const reqUrl=`${API_URL}/${id}`;
    const result=apiRequest(reqUrl,updateOptions);
    if(!result){
      setFetchError(result)
    }

  }

  const handleDelete = (id) => {
    const listItems = items.filter((item) => item.id !== id);
    setItems(listItems);

    const deleteOptions={
      method:'DELETE'
    };
    const reqUrl=`${API_URL}/${id}`;
    const result=apiRequest(reqUrl,deleteOptions);
    if(!result){
      setFetchError(result);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newItem) return;
    addItem(newItem);
    setNewItem('');
  }

  return (
    <div className="App">
      <Header title="Grocery List" />   
      <AddItem
        newItem={newItem}
        setNewItem={setNewItem}
        handleSubmit={handleSubmit}
      />
      <SearchItem
        search={search}
        setSearch={setSearch}
      />
      <main>
        {isLoading && <p>Loading Items...</p>}

        {fetchError && <p style={{color:"red"}}>{`Error : ${fetchError}`}</p>}
        {!fetchError && 
        <Content
          items={items.filter(item => ((item.item).toLowerCase()).includes(search.toLowerCase()))}
          handleCheck={handleCheck}
          handleDelete={handleDelete}
        />}
      </main>
      <Footer length={items.length} />
    </div>
  );
}

export default App;
