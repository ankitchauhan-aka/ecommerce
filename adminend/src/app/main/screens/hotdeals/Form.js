import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseAnimate from '@fuse/core/FuseAnimate';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FuseLoading from '@fuse/core/FuseLoading';
import Checkbox from '@material-ui/core/Checkbox';
import FuseChipSelect from '@fuse/core/FuseChipSelect';

import { useForm, useDeepCompareEffect } from '@fuse/hooks';
import _ from '@lodash';
import withReducer from 'app/store/withReducer';
import Card from '@material-ui/core/Card';
import React, { useEffect, useRef, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { resetHotDeal, saveHotDeal, newHotDeal, getHotDeal } from '../store/hotdeals/hotdealSlice';
import { getCategories, selectCategories } from '../store/category/categoriesSlice';
import { getHotDeals, selectHotDeals } from '../store/hotdeals/hotdealsSlice';
import reducer from '../store';
import Header from 'app/fuse-layouts/shared-components/Header';
import { useAlert } from 'react-alert';
import clsx from 'clsx';
import Icon from '@material-ui/core/Icon';
import { orange } from '@material-ui/core/colors';

const useStyles = makeStyles(theme => ({
	productImageFeaturedStar: {
		position: 'absolute',
		top: 0,
		right: 0,
		color: orange[400],
		opacity: 0
	},
	productImageUpload: {
		transitionProperty: 'box-shadow',
		transitionDuration: theme.transitions.duration.short,
		transitionTimingFunction: theme.transitions.easing.easeInOut
	},
	productImageItem: {
		transitionProperty: 'box-shadow',
		transitionDuration: theme.transitions.duration.short,
		transitionTimingFunction: theme.transitions.easing.easeInOut,
		'&:hover': {
			'& $productImageFeaturedStar': {
				opacity: 0.8
			}
		},
		'&.featured': {
			pointerEvents: 'none',
			boxShadow: theme.shadows[3],
			'& $productImageFeaturedStar': {
				opacity: 1
			},
			'&:hover $productImageFeaturedStar': {
				opacity: 1
			}
		}
	}
}));

function HotDealForm(props) {
	const alert = useAlert();
	const dispatch = useDispatch();
	const hotdeal = useSelector(({ app }) => app.hotdeal);
	const [noHotDeal, setNoHotDeal] = useState(false);
	const { form, handleChange, setForm, setInForm } = useForm(null);
	const classes = useStyles(props);
	const routeParams = useParams();
	const [categoryOptions, setCategoryOptions] = useState([]);
	const pageLayout = useRef(null);
	const categories = useSelector(selectCategories);

	useEffect(() => {
		dispatch(getCategories());
		dispatch(getHotDeals());
	}, [dispatch]);

	useDeepCompareEffect(() => {
		function updateHotDealState() {
			const { hotdealId } = routeParams;

			if (hotdealId === 'add') {
				dispatch(newHotDeal());
			} else {
				dispatch(getHotDeal(routeParams)).then(action => {
					if (!action.payload) {
						setNoHotDeal(true);
					}
				});
			}
		}
		updateHotDealState();
	}, [dispatch, routeParams]);

	useEffect(() => {
		if ((hotdeal && !form) || (hotdeal && form && hotdeal._id !== form._id)) {
			setForm(hotdeal);
		}
	}, [form, hotdeal, setForm]);

	useEffect(() => {
		return () => {
			dispatch(resetHotDeal());
			setNoHotDeal(false);
		};
	}, [dispatch]);

	function canBeSubmitted() {
		return form.categories.length > 0 && !_.isEqual(hotdeal, form);
	}

	function handleUploadChange(e) {
		const file = e.target.files[0];
		if (!file) {
			return;
		}
		const reader = new FileReader();
		reader.readAsBinaryString(file);

		reader.onload = () => {
			setForm(_.set({ ...form }, `image`, `data:${file.type};base64,${btoa(reader.result)}`));
		};

		reader.onerror = () => {
			console.log('error on load image');
		};
	}

	function saveSuccess() {
		alert.success('Saved!');
		props.history.push(`/admin/hotdeals`);
	}
	console.log(form, 'ooooooooooooo');
	useEffect(() => {
		if (categories) {
			const catSuggestions = categories.map(category => ({ value: category._id, label: category.title }));
			setCategoryOptions(catSuggestions);
		}
	}, [categories]);

	if (noHotDeal) {
		return (
			<FuseAnimate delay={100}>
				<div className="flex flex-col flex-1 items-center justify-center h-full">
					<Typography color="textSecondary" variant="h5">
						There is no such HotDeal!
					</Typography>
				</div>
			</FuseAnimate>
		);
	}

	if ((!hotdeal || (hotdeal && routeParams.hotdealId !== hotdeal._id)) && routeParams.hotdealId !== 'add') {
		return <FuseLoading />;
	}

	return (
		form && (
			<FusePageSimple
				classes={{
					content: 'min-h-full',
					header: 'min-h-72 h-72'
				}}
				header={
					<Header
						pageLayout={pageLayout}
						headText="ADD HOTDEAL"
						backLink="/admin/hotdeals"
						icon="local_offer"
					/>
				}
				content={
					<Card className="mx-16 my-16">
						<div className="p-16 sm:p-24 max-w-2xl">
							{/* <TextField
								className="mt-8 mb-16"
								error={form.title === ''}
								required
								label="Title"
								autoFocus
								id="title"
								name="title"
								value={form.title}
								onChange={handleChange}
								variant="outlined"
								fullWidth
							/> */}
							<TextField
								className="mt-8 mb-16"
								// error={form.fromdate === ''}
								id="fromdate"
								name="fromdate"
								autoFocus
								required
								label="From Date"
								type="date"
								// defaultValue="2017-05-24T10:30"
								InputLabelProps={{
									shrink: true
								}}
								value={form.fromdate}
								onChange={handleChange}
								variant="outlined"
								fullWidth
							/>
							<TextField
								className="mt-8 mb-16"
								autoFocus
								required
								// error={form.todate === ''}
								id="todate"
								name="todate"
								label="To Date"
								type="date"
								// defaultValue="2021-05-30T10:30"
								InputLabelProps={{
									shrink: true
								}}
								value={form.todate}
								onChange={handleChange}
								variant="outlined"
								fullWidth
							/>
							<FuseChipSelect
								className="mt-8 mb-24"
								value={form.categories.map(item => ({
									value: item.id ? item.id : item.value,
									label: item.slug ? item.slug : item.label
								}))}
								onChange={value => setInForm('categories', value)}
								placeholder="Select Product Categories"
								error={form.categories === ''}
								textFieldProps={{
									label: 'Categories',
									InputLabelProps: {
										shrink: true
									},
									variant: 'outlined'
								}}
								options={categoryOptions}
								isMulti
							/>
							<FormControl variant="outlined" className="mt-8 mb-16" fullWidth>
								<InputLabel>Status</InputLabel>
								<Select
									label="Status"
									id="active"
									name="active"
									value={form.active || 'true'}
									onChange={handleChange}
								>
									<MenuItem value="true">Active</MenuItem>
									<MenuItem value="false">InActive</MenuItem>
								</Select>
							</FormControl>
							<div>
								<div className="flex justify-center sm:justify-start flex-wrap -mx-8">
									<label
										htmlFor="button-file"
										className={clsx(
											classes.productImageUpload,
											'flex items-center justify-center relative w-128 h-128 rounded-8 mx-8 mb-16 overflow-hidden cursor-pointer shadow hover:shadow-lg'
										)}
									>
										<input
											accept="image/*"
											className="hidden"
											id="button-file"
											type="file"
											onChange={handleUploadChange}
										/>
										<Icon fontSize="large" color="action">
											cloud_upload
										</Icon>
									</label>
									{form.image && (
										<div
											role="button"
											tabIndex={0}
											className={clsx(
												classes.productImageItem,
												'flex items-center justify-center relative w-128 h-128 rounded-8 mx-8 mb-16 overflow-hidden cursor-pointer outline-none shadow hover:shadow-lg'
											)}
										>
											{/* <Icon className={clsx (classes.productImageFeaturedStar, "text-red text-20")} onClick={() => {form.image = ''}}>
												remove_circle
											</Icon> */}
											<img className="max-w-none w-auto h-full" src={form.image} alt="products" />
										</div>
									)}
								</div>
							</div>
							<FuseAnimate animation="transition.slideLeftIn" delay={500}>
								<Button
									className="whitespace-nowrap"
									variant="contained"
									color="secondary"
									disabled={!canBeSubmitted()}
									onClick={() => dispatch(saveHotDeal(form)).then(() => saveSuccess())}
								>
									Save
								</Button>
							</FuseAnimate>
							<FuseAnimate animation="transition.slideLeftIn" delay={300}>
								<Button
									className="mx-8 whitespace-nowrap"
									component={Link}
									variant="outlined"
									to="/admin/hotdeals"
									color="primary"
								>
									Cancel
								</Button>
							</FuseAnimate>
						</div>
					</Card>
				}
				ref={pageLayout}
				innerScroll
			/>
		)
	);
}

export default withReducer('app', reducer)(HotDealForm);
