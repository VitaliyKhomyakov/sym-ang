<?php

namespace App\ProductsBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class ProductsController extends Controller
{
    /**
     * @Template()
     */
    public function indexAction()
    {
        $em       = $this->getDoctrine()->getEntityManager();
        $products = $em->getRepository('AppProductsBundle:Products')->findBy([], ['id' => 'desc'], 10);
        $photos   = $em->getRepository('AppProductsBundle:ProductsPhoto');

        foreach ($products as $product) {
            $photoList = $photos->findBy(array('product_id' => $product->getId()));

            foreach ($photoList as $element) {
                $product->addPhoto($element);
            }
        }
        $countProduct = count($products);
        return ['products' => $products, 'countProduct' => $countProduct];
    }

}
