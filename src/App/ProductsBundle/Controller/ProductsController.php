<?php

namespace App\ProductsBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class ProductsController extends Controller
{
    const PRODUCTS_LIMIT = 5;

    /**
     * @Template()
     */
    public function indexAction()
    {
        $em       = $this->getDoctrine()->getManager();
        $products = $em->getRepository('AppProductsBundle:Products');
        $photos   = $em->getRepository('AppProductsBundle:ProductsPhoto');

        $countProduct = $products->getQuantityProducts();
        $productsList = $products->findBy([], ['id' => 'desc'], self::PRODUCTS_LIMIT);
        foreach ($productsList as $product) {
            $photoList = $photos->findBy(array('product_id' => $product->getId()));
            foreach ($photoList as $element) {
                $product->addPhoto($element);
            }
        }

        return ['products' => $productsList, 'countProduct' => $countProduct];
    }

}
