import React, { useEffect } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
// import { Carousel } from 'react-responsive-carousel';
// import Product from '../components/Product';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, listProducts } from '../actions/productActions';
import { listTopSellers } from '../actions/userActions';
import { useNavigate } from 'react-router-dom';
import {
  PRODUCT_CREATE_RESET,
} from '../constants/productConstants';
import axios from 'axios';
import LiveTracker from '../components/LocationTracker';

export default function HomeScreen() {
  const navigate = useNavigate()
  const dispatch = useDispatch();

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  useEffect(()=>{


    async function fetchData () {

    if(localStorage.getItem('faceId')){
      navigate('/')
    }

    if(!userInfo){
      navigate('/signin')
    }

    try {
      const FoundFaceData = await axios.get(`/api/users/get-face-data/${userInfo?._id}`);
      console.log(FoundFaceData)
      if(FoundFaceData.data.faceDescriptor?.length !==0){
        if(!localStorage.getItem('faceId')){
          navigate('/face-id?ref=login')
        }else{
          console.log('HI WELCOME')
        }
      }else{
        navigate('/face-id?ref=new')
      }
    
      }catch(error){
         navigate('/face-id?ref=error')
      }

    }

    fetchData()

  },[userInfo,navigate])
  


  const productCreate = useSelector((state) => state.productCreate);

  const {
    loading: loadingCreate,
    // error: errorCreate,
    success: successCreate,
    product: createdProduct,
  } = productCreate;

  const userTopSellersList = useSelector((state) => state.userTopSellersList);
  const {
    loading: loadingSellers,
    error: errorSellers,
    users: sellers,
  } = userTopSellersList;




  useEffect(() => {
    if (successCreate) {
      dispatch({ type: PRODUCT_CREATE_RESET });
      navigate(`/product/${createdProduct._id}/edit`);
    }
    dispatch(listProducts({}));
    dispatch(listTopSellers());
  }, [dispatch,successCreate,navigate,createdProduct]);
  
  const createHandler = () => {
    dispatch(createProduct());
  };
  
  return (
    <div style={{display:'grid',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      {userInfo && !userInfo.isAdmin && <LiveTracker />}
      <h2 className='mx-auto text-center font-bold text-2xl text-red-600 mt-5'>Members Panel</h2>
      <h1 className='sm:mx-auto text-lg font-bold mb-10 mt-2'>Hi, {userInfo?.name}</h1>
      {loadingSellers || loadingCreate ? (
        <LoadingBox></LoadingBox>
      ) : errorSellers ? (
        <MessageBox variant="danger">{errorSellers}</MessageBox>
      ) : (
        <>
          {sellers.length === 0 && <MessageBox>No Seller Found</MessageBox>}
          <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{textAlign:'center'}}>
          <button onClick={createHandler} style={{padding:'12px',backgroundColor:'hsl(349, 100%, 60%)',fontWeight:'bold',margin:'10px',color:'white'}} className='btn'><i className='fa fa-plus'></i> Add Products</button>
          <a href='/productlist/seller' style={{padding:'12px',backgroundColor:'hsl(349, 100%, 60%)',fontWeight:'bold',margin:'10px',color:'white'}} className='btn'>My Products</a>
          <a href={userInfo && userInfo?.isAdmin ? '/support' : '/chat'} style={{padding:'12px',backgroundColor:'hsl(349, 100%, 60%)',fontWeight:'bold',margin:'10px',color:'white'}} className='btn'><i className='fa fa-comment'></i>  Inbox</a>
          <a href='/attendence' style={{padding:'12px',backgroundColor:'hsl(349, 100%, 60%)',fontWeight:'bold',margin:'10px',color:'white'}} className='btn'>Attendence</a>
          <a href='/workers' style={{padding:'12px',backgroundColor:'hsl(349, 100%, 60%)',fontWeight:'bold',margin:'10px',color:'white'}} className='btn'>Workers</a>
          {userInfo && userInfo?.isAdmin && <a href='/userlist' style={{padding:'12px',backgroundColor:'hsl(349, 100%, 60%)',fontWeight:'bold',margin:'10px',color:'white'}} className='btn'>All Users</a>}
          {userInfo && userInfo.isAdmin && <a href='/live-tracking' style={{padding:'12px',backgroundColor:'hsl(349, 100%, 60%)',fontWeight:'bold',margin:'10px',color:'white'}} className='btn'><i className='fa fa-map-marker' /> Track Users</a>}
            </div>
          </div>
        </>
      )}


    </div>
  );
}
