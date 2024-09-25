import React, { useEffect } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import Product from '../components/Product';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, listProducts } from '../actions/productActions';
import { listTopSellers } from '../actions/userActions';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  PRODUCT_CREATE_RESET,
} from '../constants/productConstants';

export default function HomeScreen() {
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;
  
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;


  const productCreate = useSelector((state) => state.productCreate);
  const {
    loading: loadingCreate,
    error: errorCreate,
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
  }, [dispatch,successCreate,navigate]);
  
  const createHandler = () => {
    dispatch(createProduct());
  };
  
  return (
    <div style={{display:'grid',alignItems:'center',justifyContent:'center'}}>
      <h2 style={{margin: '20px auto'}}>Members Panel</h2>
      {loadingSellers || loadingCreate ? (
        <LoadingBox></LoadingBox>
      ) : errorSellers ? (
        <MessageBox variant="danger">{errorSellers}</MessageBox>
      ) : (
        <>
          {sellers.length === 0 && <MessageBox>No Seller Found</MessageBox>}
          <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{textAlign:'center'}}>
          <a onClick={createHandler} style={{padding:'12px',backgroundColor:'orange',fontWeight:'bold',margin:'10px',color:'black'}} className='btn'><i className='fa fa-plus'></i> Add Project</a>
          <a href='/productlist/seller' style={{padding:'12px',backgroundColor:'orange',fontWeight:'bold',margin:'10px',color:'black'}} className='btn'>My Projects</a>
          <a href='/support' style={{padding:'12px',backgroundColor:'orange',fontWeight:'bold',margin:'10px',color:'black'}} className='btn'><i className='fa fa-comment'></i>  Inbox</a>
          <a href='/attendence' style={{padding:'12px',backgroundColor:'orange',fontWeight:'bold',margin:'10px',color:'black'}} className='btn'>Attendence</a>
          <a href='/workers' style={{padding:'12px',backgroundColor:'orange',fontWeight:'bold',margin:'10px',color:'black'}} className='btn'>Workers</a>
          {userInfo?.isAdmin && <a href='/userlist' style={{padding:'12px',backgroundColor:'orange',fontWeight:'bold',margin:'10px',color:'black'}} className='btn'>All Users</a>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
