"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import TheaterFormPage from '@/components/AdminComponent/TheaterFormPage';

const EditTheaterPage = () => {
    const params = useParams();
    const id = params.id as string;
    return <TheaterFormPage id={id} />;
};

export default EditTheaterPage;
