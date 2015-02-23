<?php

namespace App\ProductsBundle\Controller;

use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\FOSRestController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use App\ProductsBundle\Entity\ProductsPhoto;
use App\ProductsBundle\Entity\Products;

class ServiceController extends FOSRestController {


    /**
     * Returns information about the product
     *
     * @Rest\View
     */
    public function readProductAction($id) {

        $em       = $this->getDoctrine()->getManager();
        $product  = $em->getRepository('AppProductsBundle:Products')->find(['id' => $id]);

        if (!$product) {
            $error = ['code' => 'fail'];
            return new Response(json_encode($error));
        }

        $photos    = $em->getRepository('AppProductsBundle:ProductsPhoto');
        $photoList = $photos->findBy(array('product_id' => $product->getId()));
        $photo     = [];
        foreach ($photoList as $element) {
            $tmp          =& $photo[];
            $tmp['id']    = $element->getId();
            $tmp['photo'] = $element->getPhoto();
        }

        $response = [
            'code'  => 'success',
            'id'    => $product->getId(),
            'title' => $product->getTitle(),
            'description' => $product->getDescription(),
            'photo'       => $photo
        ];

        return new Response(json_encode($response));
    }

    /**
     * Adds an image to the product
     *
     * @Rest\View
     */
    public function addPhotoAction(Request $request) {

        $em         = $this->getDoctrine()->getManager();
        $product_id = (int) $request->get('product_id');
        $product    = $em->getRepository('AppProductsBundle:Products')->find(['id' => $product_id]);

        if (!$product) {
            $error = ['code' => 'fail'];
            return new Response(json_encode($error));
        }

        $file    = $request->files->get('file');
        $photos  = new ProductsPhoto();

        if(!$photos->checkSize($file->getSize())) {
            $error = [
                'code'    => 'fail',
                'error'   => 'size'
            ];
            return new Response(json_encode($error));
        }

        $photos->setFile($file);
        $photos->upload();
        $photos->setProductId($product);

        $em->persist($photos);
        $em->flush();

        $response = [
            'code'       => 'success',
            'id'         => $photos->getId(),
            'photo'      => $photos->getPhoto(),
            'product_id' => $photos->getProductId()
        ];

        return new Response(json_encode($response));
    }

    /**
     * Removes image the product
     *
     * @Rest\View
     */
    public function removePhotoAction(Request $request) {

        $em       = $this->getDoctrine()->getManager();
        $photo_id = (int) $request->get('photo_id');

        $photo    = $em->getRepository('AppProductsBundle:ProductsPhoto')->find(['id' => $photo_id]);
        if (!$photo) {
            $error = ['code' => 'fail'];
            return new Response(json_encode($error));
        }

        $photo->removeUpload();
        $em->remove($photo);
        $em->flush();

        $response = [
            'code' => 'success'
        ];

        return new Response(json_encode($response));
    }

    /**
     * Update information about product
     *
     * @Rest\View
     */
    public function updateProductAction(Request $request) {

        $product_id  = (int) $request->get('product_id');
        $title       = $request->get('title');
        $description = $request->get('description');

        $em         = $this->getDoctrine()->getManager();
        $product    = $em->getRepository('AppProductsBundle:Products')->find(['id' => $product_id]);

        if (!$product) {
            $error = ['code' => 'fail'];
            return new Response(json_encode($error));
        }

        $product->setTitle($title);
        $product->setDescription($description);

        $em->persist($product);
        $em->flush();

        $response = [
            'code' => 'success'
        ];

        return new Response(json_encode($response));
    }

    /**
     * Adding new product
     *
     * @Rest\View
     */
    public function addProductAction(Request $request) {
        $title       = $request->get('title');
        $description = $request->get('description');

        if ((!trim($title)) || (!trim($description))) {
            $error = [
                'code'  => 'fail',
                'error' => 'empty_fields'
            ];
            return new Response(json_encode($error));
        }
        $em       = $this->getDoctrine()->getManager();
        $product  = new Products();
        $product->setTitle($title);
        $product->setDescription($description);
        $em->persist($product);
        $em->flush();

        $response = [
            'code'       => 'success',
            'product_id' => $product->getId(),
            'photo'      => 'nofoto.png'
        ];

        return new Response(json_encode($response));
    }

    /**
     * Remove product and photos
     *
     * @Rest\View
     */
    public function removeProductAction(Request $request) {

        $product_id  = (int) $request->get('product_id');
        $em         = $this->getDoctrine()->getManager();
        $product    = $em->getRepository('AppProductsBundle:Products')->find(['id' => $product_id]);

        if (!$product) {
            $error = ['code' => 'fail'];
            return new Response(json_encode($error));
        }

        $photoList = $em->getRepository('AppProductsBundle:ProductsPhoto')->findBy(array('product_id' => $product->getId()));
        foreach ($photoList as $element) {
            $element->removeUpload();
            $product->removePhoto($element);
            $em->remove($element);
        }
        $em->remove($product);
        $em->flush();

        $response = [
            'code'       => 'success',
        ];

        return new Response(json_encode($response));
    }


}